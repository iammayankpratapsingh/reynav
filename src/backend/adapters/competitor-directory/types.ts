import "server-only";
// CompetitorDirectory: who else shows up for the same searches nearby, and what their presence looks like.
import type { GeoTarget } from "@/shared/types/geo";

export type CompetitorKeywordPosition = {
  keyword: string;
  /** 1-based map pack position, or null when they do not appear. */
  mapPosition: number | null;
};

export type Competitor = {
  name: string;
  websiteUrl: string | null;
  averageRating: number;
  reviewCount: number;
  reviewsLast30Days: number;
  reviewsPrevious30Days: number;
  /** Their average map pack position across the keywords checked. */
  averageMapPosition: number;
  keywordPositions: CompetitorKeywordPosition[];
  /** Services named on their listing or website, in their own words. */
  services: string[];
  /** Topics of the pages on their website, e.g. a service name, "Pricing", "Gallery". */
  pageTopics: string[];
  totalPages: number;
  postsLast90Days: number;
  photoCount: number;
  source: string;
  fetchedAt: Date;
};

export interface CompetitorDirectory {
  findNearby(input: { location: GeoTarget; keywords: readonly string[]; limit: number }): Promise<Competitor[]>;
}
