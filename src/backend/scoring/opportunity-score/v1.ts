// Ranks what to do next by likely impact: how much demand it touches, how far the business is from winning it,
// and how much work it is. Pure, and every benchmark arrives as a parameter.
import { clampScore, scaleBetween } from "../_support/clamp";
import type { ImpactTier } from "@/shared/types/opportunity";

export const VERSION = "opportunityScore.v1";

export type OpportunityCandidate = {
  id: string;
  title: string;
  note: string;
  /** Monthly searches the opportunity touches. Null when demand is unknown. */
  monthlySearches: number | null;
  /** Current position, or null when the business does not appear. */
  currentPosition: number | null;
  /** 0–1: how much of the gap a fix would realistically close. */
  winProbability: number;
  /** 1 is a quick win, 5 is a project. */
  effort: number;
};

export type OpportunityScoreInput = {
  candidate: OpportunityCandidate;
  benchmarks: {
    /** Searches per month that counts as a high-demand opportunity. */
    highDemandVolume: number;
    /** Position past which a keyword is treated as fully missed. */
    floorPosition: number;
  };
};

export function opportunityScoreV1({ candidate, benchmarks }: OpportunityScoreInput): number {
  const demand = scaleBetween(candidate.monthlySearches ?? 0, 0, benchmarks.highDemandVolume);
  const position = candidate.currentPosition ?? benchmarks.floorPosition;
  const gap = scaleBetween(Math.min(position, benchmarks.floorPosition), 1, benchmarks.floorPosition);
  const effortPenalty = scaleBetween(6 - candidate.effort, 0, 5);

  // Demand and gap decide whether it is worth doing; probability and effort decide whether to do it first.
  const raw = (demand * 0.4 + gap * 0.3 + effortPenalty * 0.3) * (0.5 + candidate.winProbability * 0.5);
  return clampScore(raw);
}

export function impactTierV1(score: number, thresholds: { high: number; medium: number }): ImpactTier {
  if (score >= thresholds.high) return "high";
  if (score >= thresholds.medium) return "medium";
  return "low";
}
