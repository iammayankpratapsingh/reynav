import "server-only";
// Step: check where the business ranks, then score organic visibility.
import { getRankTracker } from "@/backend/adapters/rank-tracker";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { searchVisibilityV1, VERSION } from "@/backend/scoring/sub-scores/search-visibility.v1";
import type { ScanContext } from "./scan-context";
import { readSignals, writeSignals } from "./step-store";

export async function collectRankings(scan: ScanContext): Promise<void> {
  const rankings = await getRankTracker().getRankings({
    keywords: scan.keywords,
    location: scan.geo,
    domain: new URL(scan.websiteUrl).hostname,
  });
  writeSignals(scan.scanId, { rankings });

  const volumes = new Map((readSignals(scan.scanId).volumes ?? []).map((row) => [row.keyword, row.monthlySearches]));
  const value = searchVisibilityV1({
    ranks: rankings.map((rank) => ({
      keyword: rank.keyword,
      position: rank.organicPosition,
      monthlySearches: volumes.get(rank.keyword) ?? null,
    })),
    ...scan.pack.benchmarks.searchVisibility,
  });

  await scoresRepository.put(scan.tenant, scan.scanId, { key: "visibility", value, version: VERSION });
}
