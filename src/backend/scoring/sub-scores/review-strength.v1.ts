// How strong the review profile is: rating, volume, freshness and whether the business replies.
import { scaleBetween, weightedAverage } from "../_support/clamp";

export const VERSION = "reviewStrength.v1";

export type ReviewStrengthInput = {
  /** Mean star rating, 0–5. */
  averageRating: number;
  reviewCount: number;
  reviewsLast90Days: number;
  /** Share of reviews the business has replied to, 0–1. */
  replyRate: number;
  benchmarks: {
    /** Rating at which the profile scores full marks. */
    targetRating: number;
    /** Rating at or under which it scores nothing. */
    floorRating: number;
    reviewCountTarget: number;
    recentReviewTarget: number;
  };
};

export function reviewStrengthV1(input: ReviewStrengthInput): number {
  const { benchmarks } = input;
  const rating = scaleBetween(
    input.averageRating - benchmarks.floorRating,
    0,
    benchmarks.targetRating - benchmarks.floorRating,
  );

  return weightedAverage([
    { value: rating, weight: 4 },
    { value: scaleBetween(input.reviewCount, 0, benchmarks.reviewCountTarget), weight: 3 },
    { value: scaleBetween(input.reviewsLast90Days, 0, benchmarks.recentReviewTarget), weight: 2 },
    { value: scaleBetween(input.replyRate, 0, 1), weight: 1 },
  ]);
}
