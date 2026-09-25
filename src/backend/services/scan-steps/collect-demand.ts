import "server-only";
// Step: how many people search each keyword every month. Feeds the opportunity ranking.
import { getSearchDemandProvider } from "@/backend/adapters/search-demand";
import type { ScanContext } from "./scan-context";
import { writeSignals } from "./step-store";

export async function collectDemand(scan: ScanContext): Promise<void> {
  const volumes = await getSearchDemandProvider().getMonthlyVolume({
    keywords: scan.keywords,
    location: scan.geo,
    language: "en",
  });
  writeSignals(scan.scanId, { volumes });
}
