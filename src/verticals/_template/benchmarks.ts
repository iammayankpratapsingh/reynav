// Template pack: copy this file and replace every number with one measured for the new vertical.
import type { VerticalBenchmarks } from "@/shared/types/vertical";

export const benchmarks: VerticalBenchmarks = {
  searchVisibility: { targetPosition: 3, floorPosition: 20 },
  listing: { photoTarget: 30, serviceTarget: 10, postsTarget: 12, mapTargetPosition: 3, mapFloorPosition: 20 },
  website: { fastLoadMs: 1800, slowLoadMs: 6000, servicePageTarget: 6 },
  aiVisibility: { prominentPosition: 3 },
  reviews: { targetRating: 4.8, floorRating: 3.5, reviewCountTarget: 100, recentReviewTarget: 15 },
  conversion: { targetBookingRate: 0.05, poorBounceRate: 0.7 },
  opportunity: { highDemandVolume: 800, floorPosition: 20, highImpact: 62, mediumImpact: 40 },
  averageBookingValue: 80,
  services: { defaultMinutes: 60, defaultMarginPercent: 55, inDemandSearches: 300, minServiceReviews: 10 },
};
