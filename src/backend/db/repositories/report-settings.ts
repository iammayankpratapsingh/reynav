import "server-only";
// Weekly report preferences, one row per organisation.
import { z } from "zod";
import { db } from "@/backend/db/client";
import type { TenantContext } from "@/shared/types/tenant";

export type StoredReportSettings = { weeklyEnabled: boolean; recipients: string[]; lastSentAt: string | null };

export async function find(ctx: TenantContext): Promise<StoredReportSettings | null> {
  const row = db.reportSettings.findById(ctx.organizationId);
  if (!row) return null;
  const recipients = z.array(z.string()).safeParse(JSON.parse(row.recipients_json));
  return {
    weeklyEnabled: row.weekly_enabled,
    recipients: recipients.success ? recipients.data : [],
    lastSentAt: row.last_sent_at,
  };
}

export async function save(ctx: TenantContext, settings: StoredReportSettings): Promise<void> {
  db.reportSettings.upsert({
    id: ctx.organizationId,
    organization_id: ctx.organizationId,
    weekly_enabled: settings.weeklyEnabled,
    recipients_json: JSON.stringify(settings.recipients),
    last_sent_at: settings.lastSentAt,
    updated_at: new Date().toISOString(),
  });
}
