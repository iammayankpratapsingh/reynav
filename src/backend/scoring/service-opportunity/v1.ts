// Scores how much a service is worth pushing: demand × competition × conversion × price × ranking gap, and
// flags services that are in demand but under-marketed. Pure; every threshold arrives as a parameter.
import { clampScore, scaleBetween, weightedAverage } from "../_support/clamp";
import type { Level, ServiceEvidence } from "@/shared/types/service-intelligence";

export const VERSION = "serviceOpportunity.v1";

export type ServiceOpportunityInput = {
  monthlySearches: number | null;
  organicPosition: number | null;
  competitorsOffering: number;
  totalCompetitors: number;
  averagePrice: number;
  marginPercent: number;
  benchmarks: {
    highDemandVolume: number;
    targetPosition: number;
    floorPosition: number;
    /** Share of searchers who book when a business ranks well. */
    bookingRate: number;
    /** Profit per booking that counts as a high-value service. */
    referenceProfit: number;
  };
};

export function serviceOpportunityV1(input: ServiceOpportunityInput): number {
  const { benchmarks } = input;
  const demand = scaleBetween(input.monthlySearches ?? 0, 0, benchmarks.highDemandVolume);
  const position = input.organicPosition ?? benchmarks.floorPosition;
  const rankingGap = scaleBetween(
    Math.min(position, benchmarks.floorPosition),
    benchmarks.targetPosition,
    benchmarks.floorPosition,
  );
  const competitionEase =
    input.totalCompetitors === 0 ? 100 : clampScore(100 - (input.competitorsOffering / input.totalCompetitors) * 100);
  const profitPerBooking = Math.max(0, input.averagePrice) * (Math.max(0, Math.min(100, input.marginPercent)) / 100);
  const value = scaleBetween(profitPerBooking, 0, benchmarks.referenceProfit);
  // Conversion scales the whole score: a service people rarely book online is worth less at any demand.
  const conversion = 0.6 + Math.min(1, benchmarks.bookingRate / 0.1) * 0.4;

  const base = weightedAverage([
    { value: demand, weight: 0.3 },
    { value: rankingGap, weight: 0.25 },
    { value: competitionEase, weight: 0.15 },
    { value: value, weight: 0.3 },
  ]);
  return clampScore(base * conversion);
}

export type UnderMarketedInput = {
  monthlySearches: number | null;
  organicPosition: number | null;
  mapPosition: number | null;
  competitorsAhead: number;
  reviewCount: number;
  hasServicePage: boolean;
  thresholds: {
    inDemandSearches: number;
    targetPosition: number;
    mapTargetPosition: number;
    minServiceReviews: number;
    /** Rivals ahead on the map from which it counts as evidence. */
    competitorsAhead: number;
  };
};

/** In demand, yet at least two signs it is not being marketed. Returns the evidence either way. */
export function underMarketedV1(input: UnderMarketedInput): { isUnderMarketed: boolean; evidence: ServiceEvidence[] } {
  const { thresholds: t } = input;
  const evidence: ServiceEvidence[] = [];
  if (!input.hasServicePage) evidence.push("no-page");
  if (input.reviewCount < t.minServiceReviews) evidence.push("few-reviews");
  if (input.organicPosition === null || input.organicPosition > t.targetPosition) evidence.push("low-rank");
  if (input.mapPosition === null || input.mapPosition > t.mapTargetPosition) evidence.push("not-on-maps");
  if (input.competitorsAhead >= t.competitorsAhead) evidence.push("competitors-ahead");
  const inDemand = (input.monthlySearches ?? 0) >= t.inDemandSearches;
  return { isUnderMarketed: inDemand && evidence.length >= 2, evidence };
}

export function demandLevelV1(monthlySearches: number | null, inDemandSearches: number): Level {
  const searches = monthlySearches ?? 0;
  if (searches >= inDemandSearches * 2) return "high";
  if (searches >= inDemandSearches) return "medium";
  return "low";
}

export function competitionLevelV1(competitorsOffering: number, totalCompetitors: number): Level {
  if (totalCompetitors === 0) return "low";
  const share = competitorsOffering / totalCompetitors;
  if (share >= 0.6) return "high";
  if (share >= 0.3) return "medium";
  return "low";
}
