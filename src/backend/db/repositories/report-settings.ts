import "server-only";
// Weekly report preferences, one row per organisation.
import { z } from "zod";
import { getSql } from "@/backend/db/client";
import type { TenantContext } from "@/shared/types/tenant";

export type StoredReportSettings = { weeklyEnabled: boolean; recipients: string[]; lastSentAt: string | null };

export async function find(ctx: TenantContext): Promise<StoredReportSettings | null> {
  const [row] = await getSql()<{ weekly_enabled: boolean; recipients: unknown; last_sent_at: string | null }[]>`
    select weekly_enabled, recipients, last_sent_at from report_settings where organization_id = ${ctx.organizationId}
  `;
  if (!row) return null;
  const recipients = z.array(z.string()).safeParse(row.recipients);
  return {
    weeklyEnabled: row.weekly_enabled,
    recipients: recipients.success ? recipients.data : [],
    lastSentAt: row.last_sent_at,
  };
}

export async function save(ctx: TenantContext, settings: StoredReportSettings): Promise<void> {
  const sql = getSql();
  await sql`
    insert into report_settings (organization_id, weekly_enabled, recipients, last_sent_at)
    values (${ctx.organizationId}, ${settings.weeklyEnabled}, ${sql.json(settings.recipients)}, ${settings.lastSentAt})
    on conflict (organization_id) do update set
      weekly_enabled = excluded.weekly_enabled,
      recipients = excluded.recipients,
      last_sent_at = excluded.last_sent_at,
      updated_at = now()
  `;
}
