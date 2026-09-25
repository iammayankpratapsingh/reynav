// Opportunity domain types.
import type { Range } from "./range";

export const IMPACT_TIERS = ["high", "medium", "low"] as const;

export type ImpactTier = (typeof IMPACT_TIERS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type Opportunity = {
  id: string;
  /** Position in the ranked list, 1 is the most valuable. */
  rank: number;
  title: string;
  /** One line on why it is on the list. */
  note: string;
  impact: ImpactTier;
  /** 0–100, from backend/scoring/opportunity-score. */
  score: number;
  /** Extra bookings a month this could be worth, always a range. Null when there is not enough data. */
  estimatedMonthlyBookings: Range | null;
  version: string;
};

/** Everything the opportunity screen shows. Computed during the scan and stored, never recomputed on read. */
export type OpportunityDetail = Opportunity & {
  /** The keyword this opportunity is about, when it is about one. */
  keyword: string | null;
  /** The vertical service slug, when the opportunity is a service gap. */
  serviceSlug: string | null;
  monthlySearches: number | null;
  yourPosition: number | null;
  topCompetitorPosition: number | null;
  estimatedMonthlyRevenue: Range | null;
  /** How much work the fix is, from the scoring effort estimate. */
  difficulty: Difficulty;
  /** Which location the opportunity is about, e.g. "Brampton, ON". */
  locationLabel: string;
  /** What REYNAV suggests doing, in the order it suggests doing it. */
  actions: readonly OpportunityAction[];
  competitors: readonly OpportunityCompetitor[];
  /** Content pieces from the vertical pack that fit this opportunity. */
  contentPlan: readonly OpportunityContentPiece[];
};

export type OpportunityAction = {
  id: string;
  label: string;
  /** Rough effort so the list can be ordered by quickest win. */
  effort: "quick" | "medium" | "project";
  done: boolean;
};

export type OpportunityCompetitor = {
  name: string;
  averageRating: number;
  reviewCount: number;
  averageMapPosition: number;
  /** True when this rival currently outranks the business on this opportunity. */
  outranksYou: boolean;
};

export type OpportunityContentPiece = {
  contentTypeId: string;
  name: string;
  channel: string;
  estimatedMinutes: number;
};

/** The ranked list a scan produced, with the scan it came from. */
export type OpportunityBoard = {
  scanId: string | null;
  scannedAt: string | null;
  opportunities: OpportunityDetail[];
};
