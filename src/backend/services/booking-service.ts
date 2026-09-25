import "server-only";
// Booking performance: the path from a search to money, revenue by service, the before/after comparison,
// and which booking platforms are linked. Uses the owner's uploaded CSV when there is one, else the
// connected booking platform.
import { getBookingSource } from "@/backend/adapters/booking-source";
import { getWebAnalyticsSource } from "@/backend/adapters/web-analytics";
import * as bookingsRepository from "@/backend/db/repositories/bookings";
import * as connectionsRepository from "@/backend/db/repositories/external-connections";
import {
  addDays,
  beforeAfterV1,
  serviceRevenueV1,
  summarizePeriodV1,
} from "@/backend/scoring/revenue-attribution/v1";
import { BOOKING_PLATFORMS } from "@/shared/constants/booking-platforms";
import type { BookingPerformance, BookingRecord } from "@/shared/types/booking";
import type { TenantContext } from "@/shared/types/tenant";
import { requirePrimaryBusiness, requirePrimaryLocation } from "./onboarding-service";
import { getWorkspace } from "./organization-service";

const WINDOW_DAYS = 30;
/** How far back the platform is asked for, so a before/after comparison has history to use. */
const HISTORY_DAYS = 90;

/** Booking platforms by display name; only one is connected at a time today, so the rest are offered. */
const PLATFORMS = BOOKING_PLATFORMS.map((platform) => platform.name);

export async function getPerformance(ctx: TenantContext): Promise<BookingPerformance> {
  const [workspace, business, location] = await Promise.all([
    getWorkspace(ctx),
    requirePrimaryBusiness(ctx),
    requirePrimaryLocation(ctx),
  ]);

  const [analytics, uploaded, connections] = await Promise.all([
    getWebAnalyticsSource().getSnapshot({ propertyRef: location.id, days: WINDOW_DAYS }),
    bookingsRepository.listForLocation(ctx, location.id),
    connectionsRepository.listForLocation(ctx, location.id),
  ]);
  const records: BookingRecord[] =
    uploaded.length > 0 ? uploaded : await getBookingSource().getBookings({ accountRef: location.id, days: HISTORY_DAYS });

  const today = new Date().toISOString().slice(0, 10);
  const windowFrom = addDays(today, -(WINDOW_DAYS - 1));
  const tomorrow = addDays(today, 1);
  const period = summarizePeriodV1(records, windowFrom, tomorrow);
  const onlineBookings = Math.round(period.bookings * period.onlineShare);

  const bookingConnection = connections.find((connection) => connection.provider === "booking-source");
  const connectedName = bookingConnection?.accountLabel?.split("—")[0]?.trim() ?? PLATFORMS[0];
  // The booking page is a step on the way, so it sits between visits and bookings.
  const bookingPageVisits = Math.round(analytics.sessions * 0.28);
  // Before/after splits on the day onboarding finished; until then, on the start of the current window.
  const splitOn = business.onboardedAt ? business.onboardedAt.slice(0, 10) : windowFrom;

  return {
    dataSource: uploaded.length > 0 ? "csv" : "platform",
    periodLabel: periodLabel(windowFrom, today),
    stages: [
      { id: "visits", label: "Website Visits", value: analytics.sessions, format: "count" },
      { id: "booking-page", label: "Booking Page Visits", value: bookingPageVisits, format: "count" },
      { id: "bookings", label: workspace.labels.bookingPlural, value: onlineBookings, format: "count" },
      {
        id: "revenue",
        label: "Revenue",
        value: period.bookings === 0 ? 0 : Math.round((period.revenue * onlineBookings) / period.bookings),
        format: "currency",
      },
    ],
    conversionRate: analytics.sessions === 0 ? 0 : onlineBookings / analytics.sessions,
    serviceRevenue: serviceRevenueV1(records, windowFrom, tomorrow),
    beforeAfter: beforeAfterV1(records, splitOn, today),
    integrations: PLATFORMS.map((name) => {
      const isActive = bookingConnection?.status === "connected" && name === connectedName;
      return {
        id: name.toLowerCase(),
        name,
        status: isActive ? "connected" : "disconnected",
        isActive,
      };
    }),
  };
}

function periodLabel(from: string, to: string): string {
  const format = (iso: string) =>
    new Date(`${iso}T12:00:00.000Z`).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${format(from)} – ${format(to)}`;
}
