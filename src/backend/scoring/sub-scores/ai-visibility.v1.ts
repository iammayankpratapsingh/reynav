// How often AI assistants name the business when asked for a local recommendation.
import { clampScore } from "../_support/clamp";

export const VERSION = "aiVisibility.v1";

export type AiPromptResult = {
  prompt: string;
  /** Was the business named in the answer? */
  wasMentioned: boolean;
  /** Where it appeared in the answer's list, 1-based, or null when it was not named. */
  position: number | null;
  /** How many businesses the answer named. */
  namedCount: number;
};

export type AiVisibilityInput = {
  results: readonly AiPromptResult[];
  /** Position within an answer at or above which a mention counts in full. */
  prominentPosition: number;
};

export function aiVisibilityV1(input: AiVisibilityInput): number {
  if (input.results.length === 0) return 0;

  const total = input.results.reduce((sum, result) => {
    if (!result.wasMentioned || result.position === null) return sum;
    if (result.position <= input.prominentPosition) return sum + 100;
    // Named, but further down the answer: worth less, never nothing.
    const depth = Math.max(1, result.namedCount - input.prominentPosition);
    const decay = (result.namedCount - result.position + 1) / depth;
    return sum + clampScore(40 + decay * 40);
  }, 0);

  return clampScore(total / input.results.length);
}
