import "server-only";
// BookingSource: how many bookings actually happened, so searches can be tied to revenue.
import type { BookingRecord } from "@/shared/types/booking";

export type BookingSummary = {
  bookings: number;
  /** Bookings that came from an online channel rather than phone or walk-in. */
  onlineBookings: number;
  days: number;
  source: string;
  fetchedAt: Date;
};

/** One booking as the product understands it. No customer contact details ever cross this boundary. */
export type { BookingRecord };

export interface BookingSource {
  getSummary(input: { accountRef: string; days: number }): Promise<BookingSummary>;
  /** Every booking in the window, oldest first. */
  getBookings(input: { accountRef: string; days: number }): Promise<BookingRecord[]>;
}
