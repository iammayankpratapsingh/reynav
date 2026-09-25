import "server-only";
// Mock SearchDemandProvider: fixed volumes for the demo keyword set.
import type { KeywordVolume, SearchDemandProvider } from "./types";

const volumes: Record<string, number> = {
  "haircut brampton": 1300,
  "haircut near me": 2400,
  "balayage brampton": 720,
  "balayage near me": 210,
  "hair colour brampton": 590,
  "hair colour near me": 260,
  "bridal makeup brampton": 480,
  "bridal makeup near me": 170,
  "keratin treatment brampton": 320,
  "keratin treatment near me": 110,
  "hair extensions brampton": 390,
  "hair extensions near me": 140,
  "salon brampton": 1900,
};

/** Any other keyword gets a stable made-up volume from its text, so every service has demand to show. */
function fallbackVolume(keyword: string): number {
  let hash = 0;
  for (const char of keyword) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const base = keyword.includes("near me") ? 90 : 160;
  return base + (hash % 12) * 45;
}

export class MockSearchDemand implements SearchDemandProvider {
  async getMonthlyVolume({ keywords }: { keywords: readonly string[] }): Promise<KeywordVolume[]> {
    const fetchedAt = new Date();
    return keywords.map((keyword) => ({
      keyword,
      monthlySearches: volumes[keyword] ?? fallbackVolume(keyword),
      source: "mock",
      fetchedAt,
    }));
  }
}
