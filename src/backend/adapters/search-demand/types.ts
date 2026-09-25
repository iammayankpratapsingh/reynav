import "server-only";
// SearchDemandProvider: how many people search a keyword each month.
import type { GeoTarget } from "@/shared/types/geo";

export type KeywordVolume = {
  keyword: string;
  monthlySearches: number | null; // null = provider had no data
  source: string;
  fetchedAt: Date;
};

export interface SearchDemandProvider {
  getMonthlyVolume(input: {
    keywords: readonly string[];
    location: GeoTarget;
    language: string;
  }): Promise<KeywordVolume[]>;
}
