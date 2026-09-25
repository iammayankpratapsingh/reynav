// Salon pack: conversion rates and average values by service.
import type { VerticalBenchmarks } from "@/shared/types/vertical";

export const benchmarks: VerticalBenchmarks = {
  searchVisibility: { targetPosition: 3, floorPosition: 20 },
  listing: { photoTarget: 40, serviceTarget: 12, postsTarget: 12, mapTargetPosition: 3, mapFloorPosition: 20 },
  website: { fastLoadMs: 1800, slowLoadMs: 6000, servicePageTarget: 8 },
  aiVisibility: { prominentPosition: 3 },
  reviews: { targetRating: 4.8, floorRating: 3.5, reviewCountTarget: 150, recentReviewTarget: 20 },
  conversion: { targetBookingRate: 0.06, poorBounceRate: 0.7 },
  opportunity: { highDemandVolume: 900, floorPosition: 20, highImpact: 55, mediumImpact: 35 },
  averageBookingValue: 95,
  services: { defaultMinutes: 60, defaultMarginPercent: 55, inDemandSearches: 300, minServiceReviews: 10 },
};
