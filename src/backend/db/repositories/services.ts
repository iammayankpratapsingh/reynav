import "server-only";
// Service intelligence storage: what each scan measured per service, and the owner's economics per service.
import { getSql, isUuid } from "@/backend/db/client";
import type { ServiceMetrics } from "@/shared/types/service-intelligence";
import type { TenantContext } from "@/shared/types/tenant";

export type StoredEconomics = { averagePrice: number; durationMinutes: number; marginPercent: number };

type MetricsRow = {
  service_slug: string;
  service_name: string;
  monthly_searches: number | null;
  organic_position: number | null;
  map_position: number | null;
  competitors_offering: number;
  total_competitors: number;
  competitors_ahead: number;
  review_count: number;
  has_service_page: boolean;
};

/** Replaces the metrics for a scan, so a retried step cannot duplicate rows. */
export async function replaceMetricsForScan(
  ctx: TenantContext,
  input: { scanId: string; locationId: string; metrics: readonly ServiceMetrics[] },
): Promise<void> {
  const rows = input.metrics.map((metric) => ({
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
  }));
  await getSql().begin(async (tx) => {
    await tx`delete from service_metrics where scan_id = ${input.scanId} and organization_id = ${ctx.organizationId}`;
    if (rows.length > 0) await tx`insert into service_metrics ${tx(rows)}`;
  });
}

export async function listMetricsForScan(ctx: TenantContext, scanId: string): Promise<ServiceMetrics[]> {
  if (!isUuid(scanId)) return [];
  const rows = await getSql()<MetricsRow[]>`
    select service_slug, service_name, monthly_searches, organic_position, map_position, competitors_offering,
      total_competitors, competitors_ahead, review_count, has_service_page
    from service_metrics
    where scan_id = ${scanId} and organization_id = ${ctx.organizationId}
    order by created_at, service_slug
  `;
  return rows.map((row) => ({
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
  if (!isUuid(locationId)) return new Map();
  const rows = await getSql()<
    { service_slug: string; average_price: number; duration_minutes: number; margin_percent: number }[]
  >`
    select service_slug, average_price, duration_minutes, margin_percent
    from service_economics
    where organization_id = ${ctx.organizationId} and location_id = ${locationId}
  `;
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
  await getSql()`
    insert into service_economics
      (organization_id, location_id, service_slug, average_price, duration_minutes, margin_percent)
    values (
      ${ctx.organizationId}, ${input.locationId}, ${input.serviceSlug}, ${input.averagePrice},
      ${input.durationMinutes}, ${input.marginPercent}
    )
    on conflict (location_id, service_slug) do update set
      average_price = excluded.average_price,
      duration_minutes = excluded.duration_minutes,
      margin_percent = excluded.margin_percent,
      updated_at = now()
  `;
}
