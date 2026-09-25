import "server-only";
// Step: turn the collected signals into a ranked list of what to do next, with everything the opportunity
// screen needs already worked out. Scoring decides the order and the numbers; the vertical pack supplies
// the words for services and content.
import type { Competitor } from "@/backend/adapters/competitor-directory/types";
import * as opportunitiesRepository from "@/backend/db/repositories/opportunities";
import * as servicesRepository from "@/backend/db/repositories/services";
import type { SaveOpportunityInput } from "@/backend/db/repositories/opportunities";
import { estimateMissedBookings } from "@/backend/scoring/missed-bookings/v1";
import { estimateRevenue } from "@/backend/scoring/revenue-estimate/v1";
import {
  impactTierV1,
  opportunityScoreV1,
  VERSION,
  type OpportunityCandidate,
} from "@/backend/scoring/opportunity-score/v1";
import type { OpportunityAction, OpportunityContentPiece } from "@/shared/types/opportunity";
import type { ServiceMetrics } from "@/shared/types/service-intelligence";
import type { VerticalPack } from "@/shared/types/vertical";
import type { ScanContext, ScanService } from "./scan-context";
import { readSignals } from "./step-store";

/** Every candidate worth listing is kept, so the Opportunities screen can sort and filter them; Home shows the top 5. */
const MAX_OPPORTUNITIES = 12;
const TOP_RIVALS = 3;

/** A candidate plus the context the detail screen shows around it. */
type Enriched = OpportunityCandidate & {
  keyword: string | null;
  serviceSlug: string | null;
  serviceName: string | null;
  contentTypeIds: readonly string[];
  actionLabels: readonly { label: string; effort: OpportunityAction["effort"] }[];
};

export async function explainOpportunities(scan: ScanContext): Promise<void> {
  const signals = readSignals(scan.scanId);
  // The opportunity detail shows the three rivals doing best on the map; the full list is on Competitors.
  const competitors = [...(signals.competitors ?? [])]
    .sort((a, b) => a.averageMapPosition - b.averageMapPosition)
    .slice(0, TOP_RIVALS);
  const volumes = new Map((signals.volumes ?? []).map((row) => [row.keyword, row.monthlySearches]));
  const benchmarks = scan.pack.benchmarks;
  const candidates: Enriched[] = [];

  for (const service of scan.services) {
    const serviceKeywords = (signals.rankings ?? []).filter(
      (rank) => scan.keywordService.get(rank.keyword) === service.slug,
    );
    if (serviceKeywords.length === 0) continue;

    const best = serviceKeywords.reduce((highest, rank) =>
      (volumes.get(rank.keyword) ?? 0) > (volumes.get(highest.keyword) ?? 0) ? rank : highest,
    );

    const position = best.organicPosition;
    if (position !== null && position <= benchmarks.searchVisibility.targetPosition) continue;

    const beatenByCompetitor = competitors.some(
      (competitor) => competitor.averageMapPosition < (best.mapPosition ?? benchmarks.opportunity.floorPosition),
    );

    candidates.push({
      id: `service-${service.slug}`,
      // The list shows the service on its own; the detail screen adds the city from the workspace.
      title: service.name,
      note:
        position === null
          ? "High-value search opportunity"
          : beatenByCompetitor
            ? "Competitors outperform you"
            : "High demand / low visibility",
      monthlySearches: volumes.get(best.keyword) ?? null,
      currentPosition: position,
      winProbability: position === null ? 0.65 : 0.85,
      effort: position === null ? 3 : 2,
      keyword: best.keyword,
      serviceSlug: service.slug,
      serviceName: service.name,
      contentTypeIds: ["service-page", "faqs", "google-post", "instagram-caption"],
      actionLabels: [
        { label: `Create a dedicated ${service.name} ${scan.city} landing page`, effort: "project" },
        { label: "Add 5 FAQs targeting common questions", effort: "quick" },
        { label: "Improve internal links from relevant pages", effort: "quick" },
        { label: `Publish 3 Google Business Posts about ${service.name}`, effort: "medium" },
        { label: `Ask recent ${service.name} clients for a review`, effort: "quick" },
      ],
    });
  }

  const listing = signals.listing;
  if (listing && listing.reviewsLast90Days < benchmarks.reviews.recentReviewTarget) {
    candidates.push({
      id: "reviews",
      title: "Google Reviews",
      note: "Need more service-specific reviews",
      monthlySearches: totalDemand(volumes) * 0.075,
      currentPosition: 12,
      winProbability: 0.5,
      effort: 2,
      keyword: null,
      serviceSlug: null,
      serviceName: null,
      contentTypeIds: ["review-reply", "google-qa"],
      actionLabels: [
        { label: "Ask every client for a review at checkout", effort: "quick" },
        { label: "Reply to every review within 48 hours", effort: "quick" },
        { label: "Seed the questions customers actually ask", effort: "medium" },
      ],
    });
  }

  const crawl = signals.crawl;
  if (crawl && !crawl.hasBookingLinkAboveFold) {
    candidates.push({
      id: "website-conversion",
      title: "Website Conversion",
      note: "Booking button isn't prominent enough",
      monthlySearches: totalDemand(volumes) * 0.065,
      currentPosition: null,
      winProbability: 0.4,
      effort: 3,
      keyword: null,
      serviceSlug: null,
      serviceName: null,
      contentTypeIds: ["pricing-explainer", "faqs"],
      actionLabels: [
        { label: "Put a booking button in the header on every page", effort: "quick" },
        { label: "Repeat the booking link at the end of each service page", effort: "quick" },
        { label: "Cut the booking flow to three steps", effort: "project" },
      ],
    });
  }

  const ranked: SaveOpportunityInput[] = candidates
    .map((candidate) => ({ candidate, score: opportunityScoreV1({ candidate, benchmarks: benchmarks.opportunity }) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_OPPORTUNITIES)
    .map(({ candidate, score }, index) =>
      toSaveInput(candidate, score, index + 1, competitors, scan.pack, benchmarks, scan.geo.label),
    );

  await opportunitiesRepository.replaceForScan(scan.tenant, scan.scanId, ranked);
  await servicesRepository.replaceMetricsForScan(scan.tenant, {
    scanId: scan.scanId,
    locationId: scan.locationId,
    metrics: measureServices(scan),
  });
}

/** Per-service facts for the Services screen, taken from what the earlier steps collected. */
function measureServices(scan: ScanContext): ServiceMetrics[] {
  const signals = readSignals(scan.scanId);
  const rivals = signals.competitors ?? [];
  const pages = new Set((signals.crawl?.pageTopics ?? []).map((topic) => topic.toLowerCase()));
  const reviewsByService = new Map((signals.reviews?.byService ?? []).map((row) => [row.serviceSlug, row.reviewCount]));
  const volumes = new Map((signals.volumes ?? []).map((row) => [row.keyword, row.monthlySearches]));

  return scan.services.map((service) => {
    const names = namesFor(scan, service);
    const rankings = (signals.rankings ?? []).filter((row) => scan.keywordService.get(row.keyword) === service.slug);
    const organic = best(rankings.map((row) => row.organicPosition));
    const map = best(rankings.map((row) => row.mapPosition));
    const searches = rankings.reduce((sum, row) => sum + (volumes.get(row.keyword) ?? 0), 0);

    const competitorsAhead = rivals.filter((rival) => {
      const theirs = best(
        rival.keywordPositions
          .filter((row) => scan.keywordService.get(row.keyword) === service.slug)
          .map((row) => row.mapPosition),
      );
      return theirs !== null && (map === null || theirs < map);
    }).length;

    return {
      serviceSlug: service.slug,
      serviceName: service.name,
      monthlySearches: rankings.length === 0 ? null : searches,
      organicPosition: organic,
      mapPosition: map,
      competitorsOffering: rivals.filter((rival) => rival.services.some((name) => names.has(name.toLowerCase())))
        .length,
      totalCompetitors: rivals.length,
      competitorsAhead,
      reviewCount: reviewsByService.get(service.slug) ?? 0,
      hasServicePage: [...names].some((name) => pages.has(name)),
    };
  });
}

/** The service's name plus the pack's aliases for it, lower-cased, for matching other people's wording. */
function namesFor(scan: ScanContext, service: ScanService): Set<string> {
  const known = scan.pack.services.find((candidate) => candidate.slug === service.slug);
  return new Set([service.name, ...(known ? [known.name, ...known.aliases] : [])].map((name) => name.toLowerCase()));
}

function best(positions: readonly (number | null)[]): number | null {
  const found = positions.filter((position): position is number => position !== null);
  return found.length === 0 ? null : Math.min(...found);
}

function toSaveInput(
  candidate: Enriched,
  score: number,
  rank: number,
  competitors: readonly Competitor[],
  pack: VerticalPack,
  benchmarks: VerticalPack["benchmarks"],
  locationLabel: string,
): SaveOpportunityInput {
  const bookings = estimateMissedBookings({
    monthlySearches: candidate.monthlySearches,
    currentPosition: candidate.currentPosition,
    targetPosition: benchmarks.searchVisibility.targetPosition,
    floorPosition: benchmarks.opportunity.floorPosition,
    bookingRate: benchmarks.conversion.targetBookingRate,
  });

  const yourPosition = candidate.currentPosition;
  const topCompetitorPosition =
    competitors.length === 0 ? null : Math.round(Math.min(...competitors.map((rival) => rival.averageMapPosition)));

  const contentPlan: OpportunityContentPiece[] = candidate.contentTypeIds.flatMap((id) => {
    const type = pack.contentTypes.find((contentType) => contentType.id === id);
    if (!type) return [];
    return [
      { contentTypeId: type.id, name: type.name, channel: type.channel, estimatedMinutes: type.estimatedMinutes },
    ];
  });

  return {
    rank,
    title: candidate.title,
    note: candidate.note,
    impact: impactTierV1(score, {
      high: benchmarks.opportunity.highImpact,
      medium: benchmarks.opportunity.mediumImpact,
    }),
    score,
    estimatedMonthlyBookings: bookings,
    estimatedMonthlyRevenue: bookings
      ? estimateRevenue({ bookings, averageBookingValue: benchmarks.averageBookingValue })
      : null,
    keyword: candidate.keyword,
    serviceSlug: candidate.serviceSlug,
    difficulty: candidate.effort <= 2 ? "easy" : candidate.effort === 3 ? "medium" : "hard",
    locationLabel,
    monthlySearches: candidate.monthlySearches === null ? null : Math.round(candidate.monthlySearches),
    yourPosition,
    topCompetitorPosition,
    actions: candidate.actionLabels.map((action, index) => ({
      id: `${candidate.id}-action-${index + 1}`,
      label: action.label,
      effort: action.effort,
      done: false,
    })),
    competitors: competitors.map((rival) => ({
      name: rival.name,
      averageRating: rival.averageRating,
      reviewCount: rival.reviewCount,
      averageMapPosition: rival.averageMapPosition,
      outranksYou: yourPosition === null || rival.averageMapPosition < yourPosition,
    })),
    contentPlan,
    version: VERSION,
  };
}

function totalDemand(volumes: ReadonlyMap<string, number | null>): number {
  let total = 0;
  for (const volume of volumes.values()) total += volume ?? 0;
  return total;
}
