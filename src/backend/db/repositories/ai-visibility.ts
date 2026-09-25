import "server-only";
// AI visibility checks: every question the scan asked AI answers, and whether the business was named.
import { db } from "@/backend/db/client";
import type { AiSurface, AiVisibilityCheck } from "@/shared/types/ai-search";
import type { TenantContext } from "@/shared/types/tenant";

/** Replaces the checks for a scan, so a retried step cannot duplicate rows. */
export async function replaceForScan(
  ctx: TenantContext,
  input: { scanId: string; locationId: string; checks: readonly AiVisibilityCheck[] },
): Promise<void> {
  db.aiVisibilityChecks.remove((row) => row.organization_id === ctx.organizationId && row.scan_id === input.scanId);
  const createdAt = new Date().toISOString();
  input.checks.forEach((check, index) => {
    db.aiVisibilityChecks.insert({
      id: `ai_${input.scanId}_${index}`,
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
      created_at: createdAt,
    });
  });
}

export async function listForScan(ctx: TenantContext, scanId: string): Promise<AiVisibilityCheck[]> {
  return db.aiVisibilityChecks
    .filter((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    .map((row) => ({
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
