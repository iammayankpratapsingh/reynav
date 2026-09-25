// How well the traffic the business already has turns into bookings.
import { scaleBetween, weightedAverage } from "../_support/clamp";

export const VERSION = "conversion.v1";

export type ConversionInput = {
  sessions: number;
  /** Bookings attributed to those sessions. */
  bookings: number;
  /** Share of sessions that leave without an interaction, 0–1. */
  bounceRate: number;
  benchmarks: {
    /** Booking rate that counts as full marks, e.g. 0.06 for six per hundred sessions. */
    targetBookingRate: number;
    /** Bounce rate at or over which the site scores nothing on that part. */
    poorBounceRate: number;
  };
};

export function conversionV1(input: ConversionInput): number {
  if (input.sessions === 0) return 0;
  const { benchmarks } = input;

  const bookingRate = input.bookings / input.sessions;
  const engagement = scaleBetween(benchmarks.poorBounceRate - input.bounceRate, 0, benchmarks.poorBounceRate);

  return weightedAverage([
    { value: scaleBetween(bookingRate, 0, benchmarks.targetBookingRate), weight: 4 },
    { value: engagement, weight: 1 },
  ]);
}
