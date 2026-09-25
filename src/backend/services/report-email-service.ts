import "server-only";
// The weekly report email: preferences, sending one now, and the scheduled Monday send. The numbers in it
// come from the stored scan results (via the dashboard service); the email only words them.
import { z } from "zod";
import { getEmailSender } from "@/backend/adapters/email-sender";
import * as reportSettingsRepository from "@/backend/db/repositories/report-settings";
import * as schedulingRepository from "@/backend/db/repositories/admin/scheduling";
import * as usersRepository from "@/backend/db/repositories/users";
import { logger } from "@/backend/lib/logger";
import { ValidationError } from "@/shared/errors";
import type { ReportPreferences } from "@/shared/types/settings";
import type { TenantContext } from "@/shared/types/tenant";
import { getDashboard } from "./dashboard-service";
import { requireManager } from "./connection-service";

/** A week, less a little slack so a send that ran late last Monday still goes out this Monday. */
const RESEND_AFTER_MS = 6 * 24 * 60 * 60 * 1000;
const SEND_HOUR_UTC = 13; // 08:00 in Toronto, most of the year.

const PreferencesSchema = z.object({
  weeklyEnabled: z.boolean(),
  recipients: z
    .array(z.email("One of the recipients isn't a valid email."))
    .min(1, "Add at least one recipient.")
    .max(20),
});

export async function getPreferences(ctx: TenantContext): Promise<ReportPreferences> {
  const stored = await reportSettingsRepository.find(ctx);
  const recipients = stored?.recipients.length ? stored.recipients : await defaultRecipients(ctx);
  const lastSentAt = stored?.lastSentAt ?? null;
  const weeklyEnabled = stored?.weeklyEnabled ?? true;
  return {
    weeklyEnabled,
    recipients,
    lastSentAt,
    nextSendAt: weeklyEnabled ? nextMonday(new Date()).toISOString() : null,
  };
}

export async function savePreferences(ctx: TenantContext, input: unknown): Promise<ReportPreferences> {
  requireManager(ctx);
  const parsed = PreferencesSchema.parse(input);
  const stored = await reportSettingsRepository.find(ctx);
  await reportSettingsRepository.save(ctx, { ...parsed, lastSentAt: stored?.lastSentAt ?? null });
  return getPreferences(ctx);
}

export async function sendNow(ctx: TenantContext): Promise<ReportPreferences> {
  requireManager(ctx);
  const preferences = await getPreferences(ctx);
  if (preferences.recipients.length === 0) throw new ValidationError("No recipients", "Add at least one recipient.");
  await send(ctx, preferences.recipients);
  return getPreferences(ctx);
}

/** Scheduled: every organisation with the weekly email on and nothing sent in the last week. */
export async function sendWeeklyReports(now: Date): Promise<void> {
  let sent = 0;
  for (const tenant of await schedulingRepository.listOnboardedOrganizations()) {
    const ctx: TenantContext = { organizationId: tenant.organizationId, userId: tenant.ownerUserId, role: "system" };
    try {
      const preferences = await getPreferences(ctx);
      const isDue =
        preferences.weeklyEnabled &&
        (!preferences.lastSentAt || now.getTime() - new Date(preferences.lastSentAt).getTime() >= RESEND_AFTER_MS);
      if (!isDue || preferences.recipients.length === 0) continue;
      await send(ctx, preferences.recipients);
      sent += 1;
    } catch (error) {
      logger.error({ message: "weekly report failed", organizationId: tenant.organizationId, detail: String(error) });
    }
  }
  logger.info({ message: "weekly report pass", sent });
}

async function send(ctx: TenantContext, recipients: string[]): Promise<void> {
  const data = await getDashboard(ctx);
  const growth = data.scores.growth;
  const lines = [
    `Weekly report for ${data.organizationName} — ${data.locationLabel}`,
    "",
    growth
      ? `Growth Score: ${growth.value}/100${growth.deltaVsPrevious === null ? "" : ` (${growth.deltaVsPrevious >= 0 ? "+" : ""}${growth.deltaVsPrevious} vs last scan)`}`
      : "Growth Score: not calculated yet",
    ...data.scores.subScores.map((score) => `  ${score.key}: ${score.value}/100`),
    "",
    "Top opportunities:",
    ...data.opportunities.slice(0, 3).map((opportunity, index) => {
      const range = opportunity.estimatedMonthlyBookings;
      return `  ${index + 1}. ${opportunity.title}${range ? ` — est. ${range.low}–${range.high} extra bookings a month` : ""}`;
    }),
    "",
    "Recommended this week:",
    ...data.recommendedToday.map((action) => `  • ${action.label}`),
    "",
    "Estimates are ranges, not promises. Open REYNAV for the detail.",
  ];

  await getEmailSender().send({
    to: recipients,
    subject: `Your weekly REYNAV report — ${data.locationLabel}`,
    text: lines.join("\n"),
  });
  const stored = await reportSettingsRepository.find(ctx);
  await reportSettingsRepository.save(ctx, {
    weeklyEnabled: stored?.weeklyEnabled ?? true,
    recipients,
    lastSentAt: new Date().toISOString(),
  });
  logger.info({ message: "weekly report sent", organizationId: ctx.organizationId, recipients: recipients.length });
}

async function defaultRecipients(ctx: TenantContext): Promise<string[]> {
  const members = await usersRepository.listForOrganization(ctx);
  return members.filter((member) => member.role === "owner").map((member) => member.email);
}

/** The first Monday send time strictly after `from`. */
function nextMonday(from: Date): Date {
  const next = new Date(from);
  next.setUTCHours(SEND_HOUR_UTC, 0, 0, 0);
  const MONDAY = 1;
  next.setUTCDate(next.getUTCDate() + ((MONDAY - next.getUTCDay() + 7) % 7));
  if (next.getTime() <= from.getTime()) next.setUTCDate(next.getUTCDate() + 7);
  return next;
}
