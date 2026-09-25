import "server-only";
// Mock BookingSource: a month of bookings, most of them made online, plus a deterministic 90-day booking
// history that picks up in the most recent month — the shape a business improving its search looks like.
import type { BookingRecord, BookingSource, BookingSummary } from "./types";

const SERVICES: readonly { name: string; price: number; weight: number }[] = [
  { name: "Haircut", price: 55, weight: 9 },
  { name: "Hair Colour", price: 120, weight: 4 },
  { name: "Balayage", price: 220, weight: 3 },
  { name: "Keratin Treatment", price: 250, weight: 1 },
  { name: "Bridal Makeup", price: 250, weight: 1 },
  { name: "Threading", price: 20, weight: 4 },
  { name: "Waxing", price: 45, weight: 2 },
];
const TOTAL_WEIGHT = SERVICES.reduce((sum, service) => sum + service.weight, 0);
const DAY_MS = 86_400_000;
/** The last 30 days run this much busier than the 60 before, so before/after has something to show. */
const RECENT_UPLIFT = 1.25;

function pick(seed: number): (typeof SERVICES)[number] {
  let point = seed % TOTAL_WEIGHT;
  for (const service of SERVICES) {
    if (point < service.weight) return service;
    point -= service.weight;
  }
  return SERVICES[0]!;
}

export class MockBookingSource implements BookingSource {
  async getSummary({ days }: { days: number }): Promise<BookingSummary> {
    return { bookings: 145, onlineBookings: 101, days, source: "mock", fetchedAt: new Date() };
  }

  async getBookings({ days }: { days: number }): Promise<BookingRecord[]> {
    const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`).getTime();
    const records: BookingRecord[] = [];
    for (let ago = days - 1; ago >= 0; ago -= 1) {
      const date = new Date(today - ago * DAY_MS);
      const weekday = date.getUTCDay();
      const base = weekday === 0 ? 1 : weekday === 6 ? 7 : 4;
      const count = Math.round(base * (ago < 30 ? RECENT_UPLIFT : 1) + ((ago * 7) % 3));
      for (let slot = 0; slot < count; slot += 1) {
        const seed = ago * 31 + slot * 17;
        const service = pick(seed);
        records.push({
          bookedOn: date.toISOString().slice(0, 10),
          serviceName: service.name,
          price: service.price,
          channel: seed % 10 < (ago < 30 ? 7 : 6) ? "online" : seed % 10 < 9 ? "phone" : "walk-in",
          status: seed % 23 === 0 ? "no-show" : seed % 19 === 0 ? "cancelled" : "completed",
        });
      }
    }
    return records;
  }
}
