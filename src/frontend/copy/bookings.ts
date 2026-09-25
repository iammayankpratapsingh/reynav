// Product copy for the bookings screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function bookingsCopy(labels: VerticalLabels) {
  const bookings = labels.bookingPlural;

  return {
    title: "Booking Performance",
    subtitle: `What your search visibility is actually turning into.`,
    stats: {
      visits: "Website Visits from Search",
      bookingPage: "Booking Page Visits",
      bookings: `${bookings} (from Search)`,
      revenue: "Estimated Revenue",
      conversionHint: "of visits become",
    },
    funnel: {
      heading: "From Search to Revenue",
      note: "Counts share one scale. Revenue is a different unit, so it is reported beside the chart rather than drawn as a fourth bar.",
      revenueLabel: "Estimated revenue from these",
      revenueHint: "bookings × your average booking value",
      tableToggle: "View as table",
      tableStage: "Stage",
      tableValue: "Count",
      dropLabel: "of previous stage",
    },
    integrations: {
      heading: "Connected Booking Systems",
      add: "+ Add Integration",
      connected: "Connected",
      connect: "Connect",
      note: "Connecting a platform is simulated while the providers are mocked.",
    },
    estimateNote: "Revenue comes from completed bookings at the prices in your booking data.",
    source: {
      csv: "From the booking CSV you uploaded.",
      platform: "From your booking platform (simulated while providers are mocked).",
    },
    services: {
      heading: "Revenue by service",
      intro: "Completed bookings in the last 30 days.",
      /** {count} is filled in on the client. */
      bookings: "{count} bookings",
      empty: "No completed bookings in this period.",
    },
    beforeAfter: {
      heading: "Before and after REYNAV",
      /** {date} is filled in on the client. */
      intro: "The same number of days before and after you started on {date}.",
      before: "Before",
      after: "Since",
      bookings: `${bookings}`,
      revenue: "Revenue",
      averageValue: "Average value",
      onlineShare: "Booked online",
      byService: "Change by service",
      service: "Service",
      change: "Change",
      empty: "Not enough booking history before you started to compare yet.",
      note: "A comparison, not proof: seasons and prices change too.",
    },
  } as const;
}

export type BookingsCopy = ReturnType<typeof bookingsCopy>;
