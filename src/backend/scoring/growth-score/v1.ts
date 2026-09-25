// The Growth Score: one number for the whole presence, built from the sub-scores.
// Weights are parameters with vertical defaults, never constants inside the formula.
import { clampScore } from "../_support/clamp";
import type { SubScoreKey } from "@/shared/types/score";

export const VERSION = "growthScore.v1";

export type GrowthScoreWeights = Record<SubScoreKey, number>;

export type GrowthScoreInput = {
  /** Only the sub-scores that have been computed. A partial set is not scored. */
  subScores: readonly { key: SubScoreKey; value: number }[];
  weights: GrowthScoreWeights;
};

export const DEFAULT_WEIGHTS: GrowthScoreWeights = {
  visibility: 3,
  maps: 3,
  website: 3,
  "ai-search": 2,
  reviews: 2,
  conversion: 2,
};

/** Returns null until every sub-score exists, so a partial scan never shows a misleading total. */
export function growthScoreV1(input: GrowthScoreInput): number | null {
  const keys = Object.keys(input.weights) as SubScoreKey[];
  if (input.subScores.length < keys.length) return null;

  let weighted = 0;
  let totalWeight = 0;
  for (const key of keys) {
    const sub = input.subScores.find((candidate) => candidate.key === key);
    if (!sub) return null;
    const weight = input.weights[key];
    weighted += sub.value * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? null : clampScore(weighted / totalWeight);
}
