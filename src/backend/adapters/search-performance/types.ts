import "server-only";
// SearchPerformanceSource: how the website actually performs in search — clicks, impressions and positions
// for the queries that show it.

export type QueryPerformance = {
  query: string;
  clicks: number;
  impressions: number;
  /** Average position across the period, 1-based. */
  averagePosition: number;
};

export type SearchPerformanceSnapshot = {
  days: number;
  clicks: number;
  impressions: number;
  averagePosition: number;
  topQueries: QueryPerformance[];
  source: string;
  fetchedAt: Date;
};

export interface SearchPerformanceSource {
  getSnapshot(input: { propertyRef: string; days: number }): Promise<SearchPerformanceSnapshot>;
}
