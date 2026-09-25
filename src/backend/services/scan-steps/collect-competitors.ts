import "server-only";
// Step: find the nearby rivals for the same searches and store them beside the business, as one snapshot.
// Runs after the listing, website and rankings steps, because the "You" row is built from what they found.
import { getCompetitorDirectory } from "@/backend/adapters/competitor-directory";
import type { Competitor } from "@/backend/adapters/competitor-directory/types";
import * as competitorsRepository from "@/backend/db/repositories/competitors";
import type { CompetitorProfile, ServiceMapPosition } from "@/shared/types/competitor";
import type { ScanContext } from "./scan-context";
import { readSignals, writeSignals } from "./step-store";

const NEARBY_LIMIT = 10;

export async function collectCompetitors(scan: ScanContext): Promise<void> {
  const rivals = await getCompetitorDirectory().findNearby({
    location: scan.geo,
    keywords: scan.keywords,
    limit: NEARBY_LIMIT,
  });
  writeSignals(scan.scanId, { competitors: rivals });

  const profiles = [selfProfile(scan), ...rivals.map((rival) => rivalProfile(scan, rival))];
  await competitorsRepository.replaceForScan(scan.tenant, {
    scanId: scan.scanId,
    locationId: scan.locationId,
    profiles,
  });
}

/** Best map position per service across that service's keywords. */
function byService(
  scan: ScanContext,
  positions: readonly { keyword: string; mapPosition: number | null }[],
): ServiceMapPosition[] {
  return scan.services.map((service) => {
    const found = positions
      .filter((row) => scan.keywordService.get(row.keyword) === service.slug)
      .map((row) => row.mapPosition)
      .filter((position): position is number => position !== null);
    return {
      serviceSlug: service.slug,
      serviceName: service.name,
      mapPosition: found.length > 0 ? Math.min(...found) : null,
    };
  });
}

function selfProfile(scan: ScanContext): CompetitorProfile {
  const { listing, crawl, rankings = [] } = readSignals(scan.scanId);
  const mapPositions = rankings.map((row) => row.mapPosition).filter((value): value is number => value !== null);
  return {
    name: scan.businessName,
    isYou: true,
    websiteUrl: scan.websiteUrl,
    averageRating: listing?.averageRating ?? 0,
    reviewCount: listing?.reviewCount ?? 0,
    reviewsLast30Days: listing?.reviewsLast30Days ?? 0,
    reviewsPrevious30Days: Math.max(
      0,
      Math.round(((listing?.reviewsLast90Days ?? 0) - (listing?.reviewsLast30Days ?? 0)) / 2),
    ),
    averageMapPosition:
      mapPositions.length > 0
        ? Math.round((mapPositions.reduce((sum, value) => sum + value, 0) / mapPositions.length) * 10) / 10
        : null,
    services: scan.serviceNames,
    pageTopics: crawl?.pageTopics ?? [],
    pageCount: crawl?.totalPages ?? 0,
    postsLast90Days: listing?.postsLast90Days ?? 0,
    photoCount: listing?.photoCount ?? 0,
    mapPositions: byService(scan, rankings),
  };
}

function rivalProfile(scan: ScanContext, rival: Competitor): CompetitorProfile {
  return {
    name: rival.name,
    isYou: false,
    websiteUrl: rival.websiteUrl,
    averageRating: rival.averageRating,
    reviewCount: rival.reviewCount,
    reviewsLast30Days: rival.reviewsLast30Days,
    reviewsPrevious30Days: rival.reviewsPrevious30Days,
    averageMapPosition: rival.averageMapPosition,
    services: rival.services,
    pageTopics: rival.pageTopics,
    pageCount: rival.totalPages,
    postsLast90Days: rival.postsLast90Days,
    photoCount: rival.photoCount,
    mapPositions: byService(scan, rival.keywordPositions),
  };
}
