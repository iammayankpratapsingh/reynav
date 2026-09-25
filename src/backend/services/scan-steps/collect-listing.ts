import "server-only";
// Step: read the local listing, then score both its quality and the review profile.
import { getLocalListingSource } from "@/backend/adapters/local-listing";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { listingQualityV1, VERSION as LISTING_VERSION } from "@/backend/scoring/sub-scores/listing-quality.v1";
import { reviewStrengthV1, VERSION as REVIEW_VERSION } from "@/backend/scoring/sub-scores/review-strength.v1";
import type { ScanContext } from "./scan-context";
import { readSignals, writeSignals } from "./step-store";

/** The map position comes from the rankings step; when it has not run yet the listing scores without it. */
function averageMapPosition(scanId: string): number | null {
  const rankings = readSignals(scanId).rankings ?? [];
  const found = rankings.map((rank) => rank.mapPosition).filter((position): position is number => position !== null);
  if (found.length === 0) return null;
  return found.reduce((sum, position) => sum + position, 0) / found.length;
}

export async function collectListing(scan: ScanContext): Promise<void> {
  const listing = await getLocalListingSource().getSnapshot({ locationRef: scan.locationId });
  writeSignals(scan.scanId, { listing });

  const maps = listingQualityV1({
    hasCompleteHours: listing.hasCompleteHours,
    hasPrimaryCategory: listing.hasPrimaryCategory,
    hasDescription: listing.hasDescription,
    photoCount: listing.photoCount,
    serviceCount: listing.serviceCount,
    postsLast90Days: listing.postsLast90Days,
    averageMapPosition: averageMapPosition(scan.scanId),
    benchmarks: scan.pack.benchmarks.listing,
  });

  const reviews = reviewStrengthV1({
    averageRating: listing.averageRating,
    reviewCount: listing.reviewCount,
    reviewsLast90Days: listing.reviewsLast90Days,
    replyRate: listing.replyRate,
    benchmarks: scan.pack.benchmarks.reviews,
  });

  await scoresRepository.put(scan.tenant, scan.scanId, { key: "maps", value: maps, version: LISTING_VERSION });
  await scoresRepository.put(scan.tenant, scan.scanId, { key: "reviews", value: reviews, version: REVIEW_VERSION });
}
