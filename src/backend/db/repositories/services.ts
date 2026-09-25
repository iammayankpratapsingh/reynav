import "server-only";
// Service intelligence storage: what each scan measured per service, and the owner's economics per service.
import { db } from "@/backend/db/client";
import type { ServiceMetrics } from "@/shared/types/service-intelligence";
import type { TenantContext } from "@/shared/types/tenant";

export type StoredEconomics = { averagePrice: number; durationMinutes: number; marginPercent: number };

/** Replaces the metrics for a scan, so a retried step cannot duplicate rows. */
export async function replaceMetricsForScan(
  ctx: TenantContext,
  input: { scanId: string; locationId: string; metrics: readonly ServiceMetrics[] },
): Promise<void> {
  db.serviceMetrics.remove((row) => row.organization_id === ctx.organizationId && row.scan_id === input.scanId);
  const createdAt = new Date().toISOString();
  for (const metric of input.metrics) {
    db.serviceMetrics.insert({
      id: `svc_${input.scanId}_${metric.serviceSlug}`,
      organization_id: ctx.organizationId,
      location_id: input.locationId,
      scan_id: input.scanId,
      service_slug: metric.serviceSlug,
      service_name: metric.serviceName,
      monthly_searches: metric.monthlySearches,
      organic_position: metric.organicPosition,
      map_position: metric.mapPosition,
      competitors_offering: metric.competitorsOffering,
      total_competitors: metric.totalCompetitors,
      competitors_ahead: metric.competitorsAhead,
      review_count: metric.reviewCount,
      has_service_page: metric.hasServicePage,
      created_at: createdAt,
    });
  }
}

export async function listMetricsForScan(ctx: TenantContext, scanId: string): Promise<ServiceMetrics[]> {
  return db.serviceMetrics
    .filter((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId)
    .map((row) => ({
      serviceSlug: row.service_slug,
      serviceName: row.service_name,
      monthlySearches: row.monthly_searches,
      organicPosition: row.organic_position,
      mapPosition: row.map_position,
      competitorsOffering: row.competitors_offering,
      totalCompetitors: row.total_competitors,
      competitorsAhead: row.competitors_ahead,
      reviewCount: row.review_count,
      hasServicePage: row.has_service_page,
    }));
}

export async function listEconomics(ctx: TenantContext, locationId: string): Promise<Map<string, StoredEconomics>> {
  const rows = db.serviceEconomics.filter(
    (row) => row.organization_id === ctx.organizationId && row.location_id === locationId,
  );
  return new Map(
    rows.map((row) => [
      row.service_slug,
      { averagePrice: row.average_price, durationMinutes: row.duration_minutes, marginPercent: row.margin_percent },
    ]),
  );
}

export async function saveEconomics(
  ctx: TenantContext,
  input: { locationId: string; serviceSlug: string } & StoredEconomics,
): Promise<void> {
  db.serviceEconomics.upsert({
    id: `econ_${ctx.organizationId}_${input.locationId}_${input.serviceSlug}`,
    organization_id: ctx.organizationId,
    location_id: input.locationId,
    service_slug: input.serviceSlug,
    average_price: input.averagePrice,
    duration_minutes: input.durationMinutes,
    margin_percent: input.marginPercent,
    updated_at: new Date().toISOString(),
  });
}
