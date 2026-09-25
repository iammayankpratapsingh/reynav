import "server-only";
// Service intelligence: the scan's per-service facts, the owner's economics, and a score recalculated from
// both on every read — so changing a price updates the ranking straight away.
import * as scansRepository from "@/backend/db/repositories/scans";
import * as servicesRepository from "@/backend/db/repositories/services";
import { estimateMissedBookings } from "@/backend/scoring/missed-bookings/v1";
import { estimateRevenue } from "@/backend/scoring/revenue-estimate/v1";
import {
  competitionLevelV1,
  demandLevelV1,
  serviceOpportunityV1,
  underMarketedV1,
  VERSION,
} from "@/backend/scoring/service-opportunity/v1";
import { ServiceEconomicsSchema } from "@/shared/schemas/service";
import type {
  ServiceBoard,
  ServiceEconomics,
  ServiceInsight,
  ServiceMetrics,
} from "@/shared/types/service-intelligence";
import type { TenantContext } from "@/shared/types/tenant";
import type { VerticalPack } from "@/shared/types/vertical";
import { getVertical } from "@/verticals";
import { requireManager } from "./connection-service";
import { requirePrimaryLocation } from "./onboarding-service";
import { getWorkspace } from "./organization-service";

const RECENT_WINDOW = 20;
/** Rivals ahead on the map from which that counts as evidence of under-marketing. */
const COMPETITORS_AHEAD_EVIDENCE = 3;

export async function getBoard(ctx: TenantContext): Promise<ServiceBoard> {
  const [workspace, location, recent] = await Promise.all([
    getWorkspace(ctx),
    requirePrimaryLocation(ctx),
    scansRepository.listRecent(ctx, RECENT_WINDOW),
  ]);
  const pack = getVertical(workspace.verticalId);
  const economics = await servicesRepository.listEconomics(ctx, location.id);

  for (const scan of recent) {
    const metrics = await servicesRepository.listMetricsForScan(ctx, scan.id);
    if (metrics.length === 0) continue;
    return {
      scanId: scan.id,
      scannedAt: scan.finishedAt ?? scan.startedAt,
      services: metrics
        .map((metric) => toInsight(metric, economicsFor(metric, economics, pack), pack))
        .sort((a, b) => b.opportunityScore - a.opportunityScore),
    };
  }
  return { scanId: null, scannedAt: null, services: [] };
}

export async function saveEconomics(ctx: TenantContext, input: unknown): Promise<ServiceBoard> {
  requireManager(ctx);
  const parsed = ServiceEconomicsSchema.parse(input);
  const location = await requirePrimaryLocation(ctx);
  await servicesRepository.saveEconomics(ctx, { locationId: location.id, ...parsed });
  return getBoard(ctx);
}

function economicsFor(
  metric: ServiceMetrics,
  stored: ReadonlyMap<string, servicesRepository.StoredEconomics>,
  pack: VerticalPack,
): ServiceEconomics {
  const own = stored.get(metric.serviceSlug);
  if (own) return { ...own, isOwnerEntered: true };
  const known = pack.services.find((service) => service.slug === metric.serviceSlug);
  return {
    averagePrice: known?.typicalPrice ?? pack.benchmarks.averageBookingValue,
    durationMinutes: known?.typicalMinutes ?? pack.benchmarks.services.defaultMinutes,
    marginPercent: pack.benchmarks.services.defaultMarginPercent,
    isOwnerEntered: false,
  };
}

function toInsight(metric: ServiceMetrics, economics: ServiceEconomics, pack: VerticalPack): ServiceInsight {
  const b = pack.benchmarks;
  const profitPerBooking = economics.averagePrice * (economics.marginPercent / 100);
  const bookings = estimateMissedBookings({
    monthlySearches: metric.monthlySearches,
    currentPosition: metric.organicPosition,
    targetPosition: b.searchVisibility.targetPosition,
    floorPosition: b.opportunity.floorPosition,
    bookingRate: b.conversion.targetBookingRate,
  });
  const marketing = underMarketedV1({
    ...metric,
    thresholds: {
      inDemandSearches: b.services.inDemandSearches,
      targetPosition: b.searchVisibility.targetPosition,
      mapTargetPosition: b.listing.mapTargetPosition,
      minServiceReviews: b.services.minServiceReviews,
      competitorsAhead: COMPETITORS_AHEAD_EVIDENCE,
    },
  });

  return {
    ...metric,
    demand: demandLevelV1(metric.monthlySearches, b.services.inDemandSearches),
    competition: competitionLevelV1(metric.competitorsOffering, metric.totalCompetitors),
    economics,
    opportunityScore: serviceOpportunityV1({
      monthlySearches: metric.monthlySearches,
      organicPosition: metric.organicPosition,
      competitorsOffering: metric.competitorsOffering,
      totalCompetitors: metric.totalCompetitors,
      averagePrice: economics.averagePrice,
      marginPercent: economics.marginPercent,
      benchmarks: {
        highDemandVolume: b.opportunity.highDemandVolume,
        targetPosition: b.searchVisibility.targetPosition,
        floorPosition: b.opportunity.floorPosition,
        bookingRate: b.conversion.targetBookingRate,
        referenceProfit: b.averageBookingValue,
      },
    }),
    scoreVersion: VERSION,
    estimatedMonthlyProfit: bookings ? estimateRevenue({ bookings, averageBookingValue: profitPerBooking }) : null,
    isUnderMarketed: marketing.isUnderMarketed,
    evidence: marketing.evidence,
  };
}
