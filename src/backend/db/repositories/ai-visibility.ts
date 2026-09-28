import "server-only";
// AI visibility checks: every question the scan asked AI answers, and whether the business was named.
import { getSql, isUuid } from "@/backend/db/client";
import type { AiSurface, AiVisibilityCheck } from "@/shared/types/ai-search";
import type { TenantContext } from "@/shared/types/tenant";

/** Replaces the checks for a scan, so a retried step cannot duplicate rows. */
export async function replaceForScan(
  ctx: TenantContext,
  input: { scanId: string; locationId: string; checks: readonly AiVisibilityCheck[] },
): Promise<void> {
  const rows = input.checks.map((check, index) => ({
    organization_id: ctx.organizationId,
    location_id: input.locationId,
    scan_id: input.scanId,
    prompt: check.prompt,
    service_slug: check.serviceSlug,
    service_name: check.serviceName,
    location_label: check.locationLabel,
    surface: check.surface,
    was_mentioned: check.wasMentioned,
    position: check.position,
    named_count: check.namedCount,
    sort_order: index,
  }));
  await getSql().begin(async (tx) => {
    await tx`delete from ai_visibility_checks where scan_id = ${input.scanId} and organization_id = ${ctx.organizationId}`;
    if (rows.length > 0) await tx`insert into ai_visibility_checks ${tx(rows)}`;
  });
}

type CheckRow = {
  prompt: string;
  service_slug: string | null;
  service_name: string | null;
  location_label: string;
  surface: string;
  was_mentioned: boolean;
  position: number | null;
  named_count: number;
};

export async function listForScan(ctx: TenantContext, scanId: string): Promise<AiVisibilityCheck[]> {
  if (!isUuid(scanId)) return [];
  const rows = await getSql()<CheckRow[]>`
    select prompt, service_slug, service_name, location_label, surface, was_mentioned, position, named_count
    from ai_visibility_checks
    where scan_id = ${scanId} and organization_id = ${ctx.organizationId}
    order by sort_order
  `;
  return rows.map((row) => ({
    prompt: row.prompt,
    serviceSlug: row.service_slug,
    serviceName: row.service_name,
    locationLabel: row.location_label,
    surface: row.surface as AiSurface,
    wasMentioned: row.was_mentioned,
    position: row.position,
    namedCount: row.named_count,
  }));
}
