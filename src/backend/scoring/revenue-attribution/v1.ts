// Revenue attribution: totals for a period, revenue by service, and the before/after comparison around the
// day REYNAV started. Pure: bookings and dates come in, figures go out. Only completed bookings earn revenue.
import type { BeforeAfter, BookingRecord, PeriodSummary, ServiceRevenue } from "@/shared/types/booking";

export const VERSION = "revenueAttribution.v1";

const DAY_MS = 86_400_000;

export function addDays(isoDate: string, days: number): string {
  return new Date(new Date(`${isoDate}T00:00:00.000Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Bookings with bookedOn in [from, to), both ISO dates. */
function within(records: readonly BookingRecord[], from: string, to: string): BookingRecord[] {
  return records.filter((record) => record.bookedOn >= from && record.bookedOn < to);
}

export function summarizePeriodV1(records: readonly BookingRecord[], from: string, to: string): PeriodSummary {
  const inPeriod = within(records, from, to);
  const completed = inPeriod.filter((record) => record.status === "completed");
  const revenue = Math.round(completed.reduce((sum, record) => sum + record.price, 0));
  return {
    from,
    to: addDays(to, -1),
    bookings: completed.length,
    revenue,
    averageValue: completed.length === 0 ? 0 : Math.round(revenue / completed.length),
    onlineShare:
      inPeriod.length === 0 ? 0 : inPeriod.filter((record) => record.channel === "online").length / inPeriod.length,
  };
}

export function serviceRevenueV1(records: readonly BookingRecord[], from: string, to: string): ServiceRevenue[] {
  const completed = within(records, from, to).filter((record) => record.status === "completed");
  const total = completed.reduce((sum, record) => sum + record.price, 0);
  const byService = new Map<string, { bookings: number; revenue: number }>();
  for (const record of completed) {
    const entry = byService.get(record.serviceName) ?? { bookings: 0, revenue: 0 };
    entry.bookings += 1;
    entry.revenue += record.price;
    byService.set(record.serviceName, entry);
  }
  return [...byService.entries()]
    .map(([serviceName, entry]) => ({
      serviceName,
      bookings: entry.bookings,
      revenue: Math.round(entry.revenue),
      share: total === 0 ? 0 : entry.revenue / total,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * The same number of days before and after the split. Returns null when there is no history before the
 * split, because a comparison with nothing would read as growth that did not happen.
 */
export function beforeAfterV1(records: readonly BookingRecord[], splitOn: string, today: string): BeforeAfter | null {
  const days = Math.max(1, Math.round((new Date(today).getTime() - new Date(splitOn).getTime()) / DAY_MS) + 1);
  const beforeFrom = addDays(splitOn, -days);
  if (!records.some((record) => record.bookedOn >= beforeFrom && record.bookedOn < splitOn)) return null;

  const afterTo = addDays(today, 1);
  const before = summarizePeriodV1(records, beforeFrom, splitOn);
  const after = summarizePeriodV1(records, splitOn, afterTo);
  const beforeByService = new Map(
    serviceRevenueV1(records, beforeFrom, splitOn).map((row) => [row.serviceName, row.revenue]),
  );
  const afterByService = new Map(
    serviceRevenueV1(records, splitOn, afterTo).map((row) => [row.serviceName, row.revenue]),
  );
  const names = [...new Set([...beforeByService.keys(), ...afterByService.keys()])];

  return {
    splitOn,
    before,
    after,
    byService: names
      .map((serviceName) => ({
        serviceName,
        beforeRevenue: beforeByService.get(serviceName) ?? 0,
        afterRevenue: afterByService.get(serviceName) ?? 0,
      }))
      .sort((a, b) => b.afterRevenue - b.beforeRevenue - (a.afterRevenue - a.beforeRevenue)),
  };
}
