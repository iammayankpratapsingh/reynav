import "server-only";
// CompetitorDirectory: who else shows up for the same searches nearby, and what their presence looks like.
import type { GeoArea } from "@/shared/types/geo";

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
  /** Straight-line distance from the searched location, in kilometres. */
  distanceKm: number;
  source: string;
  fetchedAt: Date;
};

export type FindNearbyInput = {
  /** The location and how far around it to look. Only businesses inside the radius are returned. */
  area: GeoArea;
  keywords: readonly string[];
  limit: number;
};

export interface CompetitorDirectory {
  findNearby(input: FindNearbyInput): Promise<Competitor[]>;
}
