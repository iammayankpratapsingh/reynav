// How many bookings a month the business is likely missing on one opportunity.
// Always returned as a range, never a single figure, and null when there is not enough to say.
import type { Range } from "@/shared/types/range";

export const VERSION = "missedBookings.v1";

export type MissedBookingsInput = {
  monthlySearches: number | null;
  /** Current position, or null when the business does not appear at all. */
  currentPosition: number | null;
  targetPosition: number;
  floorPosition: number;
  /** Share of visitors who book, 0–1. */
  bookingRate: number;
};

/** Rough share of clicks a position earns. Index 0 is position 1. */
const CLICK_SHARE = [0.28, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018];

function clickShare(position: number): number {
  if (position < 1) return 0;
  return CLICK_SHARE[Math.min(position, CLICK_SHARE.length) - 1] ?? 0.01;
}

export function estimateMissedBookings(input: MissedBookingsInput): Range | null {
  if (input.monthlySearches === null || input.monthlySearches <= 0) return null;

  const current = input.currentPosition === null ? 0 : clickShare(input.currentPosition);
  const target = clickShare(input.targetPosition);
  const gain = Math.max(0, target - current);
  if (gain === 0) return null;

  const centre = input.monthlySearches * gain * input.bookingRate;
  // A wide band, because the inputs are estimates themselves.
  return { low: Math.max(0, Math.floor(centre * 0.6)), high: Math.ceil(centre * 1.4) };
}
