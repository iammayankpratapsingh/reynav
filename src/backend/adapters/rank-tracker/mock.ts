import "server-only";
// Mock RankTracker: deterministic positions for the demo keyword set. First-class implementation, not a test helper.
import type { KeywordRanking, RankRequest, RankTracker } from "./types";

/** Positions are fixed so every scan of the demo tenant scores identically. */
const positions: Record<string, { organic: number | null; map: number | null }> = {
  "haircut brampton": { organic: 3, map: 2 },
  "haircut near me": { organic: 3, map: 3 },
  "balayage brampton": { organic: 14, map: 5 },
  "balayage near me": { organic: 18, map: 7 },
  "hair colour brampton": { organic: 9, map: 3 },
  "hair colour near me": { organic: 12, map: 4 },
  "bridal makeup brampton": { organic: null, map: null },
  "bridal makeup near me": { organic: null, map: null },
  "keratin treatment brampton": { organic: 6, map: 3 },
  "keratin treatment near me": { organic: 11, map: 5 },
  "hair extensions brampton": { organic: 9, map: 4 },
  "hair extensions near me": { organic: 15, map: 6 },
  "salon brampton": { organic: 2, map: 2 },
};

/** Any other keyword gets a stable made-up position from its text; roughly a third do not rank at all. */
function fallbackPosition(keyword: string): { organic: number | null; map: number | null } {
  let hash = 0;
  for (const char of keyword) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  if (hash % 3 === 0) return { organic: null, map: null };
  return { organic: 6 + (hash % 17), map: 3 + (hash % 9) };
}

export class MockRankTracker implements RankTracker {
  async getRankings(request: RankRequest): Promise<KeywordRanking[]> {
    const fetchedAt = new Date();
    return request.keywords.map((keyword) => {
      const found = positions[keyword] ?? fallbackPosition(keyword);
      return {
        keyword,
        organicPosition: found.organic,
        mapPosition: found.map,
        source: "mock",
        fetchedAt,
      };
    });
  }
}
