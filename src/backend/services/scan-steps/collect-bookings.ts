import "server-only";
// Step: pull traffic and bookings, then score how well one turns into the other.
import { getBookingSource } from "@/backend/adapters/booking-source";
import { getWebAnalyticsSource } from "@/backend/adapters/web-analytics";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { conversionV1, VERSION } from "@/backend/scoring/sub-scores/conversion.v1";
import type { ScanContext } from "./scan-context";
import { writeSignals } from "./step-store";

const WINDOW_DAYS = 30;

export async function collectBookings(scan: ScanContext): Promise<void> {
  const [analytics, bookings] = await Promise.all([
    getWebAnalyticsSource().getSnapshot({ propertyRef: scan.locationId, days: WINDOW_DAYS }),
    getBookingSource().getSummary({ accountRef: scan.locationId, days: WINDOW_DAYS }),
  ]);
  writeSignals(scan.scanId, { analytics, bookings });

  const value = conversionV1({
    sessions: analytics.sessions,
    bookings: bookings.bookings,
    bounceRate: analytics.bounceRate,
    benchmarks: scan.pack.benchmarks.conversion,
  });

  await scoresRepository.put(scan.tenant, scan.scanId, { key: "conversion", value, version: VERSION });
}
