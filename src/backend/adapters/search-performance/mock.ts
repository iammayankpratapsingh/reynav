import "server-only";
// Deterministic mock SearchPerformanceSource: a site that gets seen far more than it gets clicked.
import type { SearchPerformanceSnapshot, SearchPerformanceSource } from "./types";

export class MockSearchPerformance implements SearchPerformanceSource {
  async getSnapshot({ days }: { propertyRef: string; days: number }): Promise<SearchPerformanceSnapshot> {
    return {
      days,
      clicks: 412,
      impressions: 18_640,
      averagePosition: 14.2,
      topQueries: [
        { query: "salon near me", clicks: 96, impressions: 5_210, averagePosition: 11.4 },
        { query: "balayage brampton", clicks: 41, impressions: 1_880, averagePosition: 8.9 },
        { query: "haircut brampton", clicks: 58, impressions: 2_460, averagePosition: 9.6 },
        { query: "bridal makeup brampton", clicks: 12, impressions: 1_120, averagePosition: 18.3 },
        { query: "keratin treatment near me", clicks: 9, impressions: 940, averagePosition: 21.7 },
      ],
      source: "mock",
      fetchedAt: new Date(),
    };
  }
}
