// Turns a range of missed bookings into a range of revenue. Pure, and the booking value is a parameter.
import type { Range } from "@/shared/types/range";

export const VERSION = "revenueEstimate.v1";

export type RevenueEstimateInput = {
  bookings: Range;
  averageBookingValue: number;
};

export function estimateRevenue({ bookings, averageBookingValue }: RevenueEstimateInput): Range {
  return {
    low: Math.round(bookings.low * averageBookingValue),
    high: Math.round(bookings.high * averageBookingValue),
  };
}
