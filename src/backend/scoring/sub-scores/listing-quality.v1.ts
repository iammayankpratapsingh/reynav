// How complete and competitive the local listing is, which is what the map pack reads.
import { scaleBetween, weightedAverage } from "../_support/clamp";

export const VERSION = "listingQuality.v1";

export type ListingQualityInput = {
  hasCompleteHours: boolean;
  hasPrimaryCategory: boolean;
  hasDescription: boolean;
  photoCount: number;
  serviceCount: number;
  postsLast90Days: number;
  /** Average position in the map pack across tracked keywords, or null when it never appears. */
  averageMapPosition: number | null;
  benchmarks: {
    photoTarget: number;
    serviceTarget: number;
    postsTarget: number;
    /** Map position at which the listing counts as fully visible. */
    mapTargetPosition: number;
    mapFloorPosition: number;
  };
};

function mapPositionScore(position: number | null, target: number, floor: number): number {
  if (position === null) return 0;
  if (position <= target) return 100;
  if (position >= floor) return 0;
  return scaleBetween(floor - position, 0, floor - target);
}

export function listingQualityV1(input: ListingQualityInput): number {
  const { benchmarks } = input;
  return weightedAverage([
    { value: mapPositionScore(input.averageMapPosition, benchmarks.mapTargetPosition, benchmarks.mapFloorPosition), weight: 4 },
    { value: scaleBetween(input.photoCount, 0, benchmarks.photoTarget), weight: 2 },
    { value: scaleBetween(input.serviceCount, 0, benchmarks.serviceTarget), weight: 2 },
    { value: scaleBetween(input.postsLast90Days, 0, benchmarks.postsTarget), weight: 1 },
    { value: input.hasCompleteHours ? 100 : 0, weight: 1 },
    { value: input.hasPrimaryCategory ? 100 : 0, weight: 1 },
    { value: input.hasDescription ? 100 : 0, weight: 1 },
  ]);
}
