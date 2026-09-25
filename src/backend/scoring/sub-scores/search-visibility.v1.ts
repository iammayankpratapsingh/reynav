// How visible the business is in organic search for the keywords it should rank for.
// Pure: same input, same output. Benchmarks arrive as parameters, never as constants.
import { clampScore, scaleBetween } from "../_support/clamp";

export const VERSION = "searchVisibility.v1";

export type KeywordRank = {
  keyword: string;
  /** 1-based position, or null when the business does not appear at all. */
  position: number | null;
  monthlySearches: number | null;
};

export type SearchVisibilityInput = {
  ranks: readonly KeywordRank[];
  /** Position at which a keyword counts as fully visible. */
  targetPosition: number;
  /** Position past which a keyword counts as invisible. */
  floorPosition: number;
};

/** A keyword's own visibility, then weighted by how many people search it. */
function positionScore(position: number | null, target: number, floor: number): number {
  if (position === null) return 0;
  if (position <= target) return 100;
  if (position >= floor) return 0;
  return scaleBetween(floor - position, 0, floor - target);
}

export function searchVisibilityV1(input: SearchVisibilityInput): number {
  if (input.ranks.length === 0) return 0;

  let weighted = 0;
  let totalWeight = 0;
  for (const rank of input.ranks) {
    const weight = rank.monthlySearches ?? 1;
    weighted += positionScore(rank.position, input.targetPosition, input.floorPosition) * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : clampScore(weighted / totalWeight);
}
