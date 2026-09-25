import "server-only";
// Step: crawl the website and score its health.
import { getWebCrawler } from "@/backend/adapters/web-crawler";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { VERSION, websiteHealthV1 } from "@/backend/scoring/sub-scores/website-health.v1";
import type { ScanContext } from "./scan-context";
import { writeSignals } from "./step-store";

export async function crawlWebsite(scan: ScanContext): Promise<void> {
  const crawl = await getWebCrawler().crawl({ url: scan.websiteUrl });
  writeSignals(scan.scanId, { crawl });

  const value = websiteHealthV1({
    loadMs: crawl.loadMs,
    isMobileFriendly: crawl.isMobileFriendly,
    hasBookingLinkAboveFold: crawl.hasBookingLinkAboveFold,
    servicePageCount: crawl.servicePageCount,
    pagesMissingMetadata: crawl.pagesMissingMetadata,
    totalPages: crawl.totalPages,
    hasStructuredData: crawl.hasStructuredData,
    benchmarks: scan.pack.benchmarks.website,
  });

  await scoresRepository.put(scan.tenant, scan.scanId, { key: "website", value, version: VERSION });
}
