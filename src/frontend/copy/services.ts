// Product copy for the services screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function servicesCopy(labels: VerticalLabels) {
  const bookings = labels.bookingPlural.toLowerCase();
  return {
    title: "Services",
    subtitle: "Every service you offer, with the demand for it, the competition, and what it's worth to you.",
    scannedPrefix: "From your scan on",
    underMarketed: {
      heading: "Under-marketed services",
      badge: "Under-marketed",
      intro: "People are searching for these, but your marketing isn't reaching them yet.",
      empty: "No service is under-marketed right now.",
      evidenceHeading: "Why we flagged it",
      checklistHeading: "What to do",
    },
    table: {
      heading: "All services",
      intro: "Enter your own price, time and margin — the score recalculates as you type.",
      caption: "Services with demand, competition, economics and opportunity score",
      service: "Service",
      demand: "Demand",
      searches: "searches / mo",
      competition: "Competition",
      offering: "{count} of {total} offer it",
      rank: "Your rank",
      notRanking: "Not ranking",
      price: "Avg. price ($)",
      duration: "Duration (min)",
      margin: "Margin (%)",
      profit: "Extra profit / mo",
      score: "Opportunity",
      estimated: "Default — enter yours",
      saving: "Saving…",
      saved: "Saved",
    },
    levels: { high: "High", medium: "Medium", low: "Low" },
    evidence: {
      "no-page": "No dedicated page for it on your website",
      "few-reviews": "Few reviews mention it ({count})",
      "low-rank": "Not in the top 3 on Google",
      "not-on-maps": "Not in the top 3 on Google Maps",
      "competitors-ahead": "{count} competitors show above you on Maps",
    },
    checklist: {
      "no-page": "Create a dedicated service page with prices, photos and FAQs",
      "few-reviews": `Ask recent clients of this service for a review`,
      "low-rank": "Target the service + city keyword in the page title and headings",
      "not-on-maps": "Add the service to your Google Business Profile with a description and price",
      "competitors-ahead": "Publish two Google posts a month featuring this service",
    },
    profitNote: `Estimated extra monthly profit if this service reached the top 3, from ${bookings} at your price and margin.`,
    empty: {
      heading: "No service data yet",
      body: "Your next scan measures demand and competition for every service you offer.",
      cta: { href: "/dashboard", label: "Go to Home" },
    },
    simulatedNote: "Simulated demand and competition while providers are mocked. Your own numbers are saved for real.",
  } as const;
}

export type ServicesCopy = ReturnType<typeof servicesCopy>;
