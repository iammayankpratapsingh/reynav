import "server-only";
// Step: read how the website performs in search (clicks, impressions, positions) when Search Console is
// connected. Without it the scan carries on; rankings still come from the rank tracker.
import { getSearchPerformanceSource } from "@/backend/adapters/search-performance";
import * as connectionsRepository from "@/backend/db/repositories/external-connections";
import type { ScanContext } from "./scan-context";
import { writeSignals } from "./step-store";

const WINDOW_DAYS = 28;

export async function collectSearchPerformance(scan: ScanContext): Promise<void> {
  const connections = await connectionsRepository.listForLocation(scan.tenant, scan.locationId);
  const isConnected = connections.some(
    (connection) => connection.provider === "search-performance" && connection.status === "connected",
  );
  if (!isConnected) return;

  const searchPerformance = await getSearchPerformanceSource().getSnapshot({
    propertyRef: scan.locationId,
    days: WINDOW_DAYS,
  });
  writeSignals(scan.scanId, { searchPerformance });
}
