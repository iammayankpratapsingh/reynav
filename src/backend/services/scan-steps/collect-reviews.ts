import "server-only";
// Step: import the listing's reviews so later steps and the review screens work from what customers wrote.
import { getLocalListingSource } from "@/backend/adapters/local-listing";
import type { ScanContext } from "./scan-context";
import { writeSignals } from "./step-store";

const REVIEW_LIMIT = 200;

export async function collectReviews(scan: ScanContext): Promise<void> {
  const reviews = await getLocalListingSource().getReviews({ locationRef: scan.locationId, limit: REVIEW_LIMIT });
  writeSignals(scan.scanId, { reviews });
}
