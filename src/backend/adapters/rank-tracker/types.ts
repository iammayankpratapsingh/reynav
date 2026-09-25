import "server-only";
// RankTracker: where the business sits for a keyword, in organic results and in the map pack.
import type { GeoTarget } from "@/shared/types/geo";

export type RankRequest = {
  keywords: readonly string[];
  location: GeoTarget;
  /** The domain whose position we are looking for. */
  domain: string;
};

export type KeywordRanking = {
  keyword: string;
  /** 1-based organic position, or null when the domain does not appear in the results checked. */
  organicPosition: number | null;
  /** 1-based map pack position, or null when the listing does not appear. */
  mapPosition: number | null;
  source: string;
  fetchedAt: Date;
};

export interface RankTracker {
  getRankings(request: RankRequest): Promise<KeywordRanking[]>;
}
