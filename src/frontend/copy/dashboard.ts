// Product copy for the dashboard screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";
import { notificationsCopy } from "./notifications";

export function dashboardCopy(labels: VerticalLabels) {
  return {
    greetings: { morning: "Good Morning", afternoon: "Good Afternoon", evening: "Good Evening" },
    growth: {
      title: `Your ${labels.business} Growth Score`,
      outOf: "/100",
      deltaSuffix: "vs last month",
      noPrevious: "First scan — nothing to compare with yet",
      calculating: "Calculating your score",
      calculatingNote: "We show each part the moment it lands, so you do not have to wait for the whole scan.",
      /** Copy crosses to a client component, so placeholders are filled in there, not by a function here. */
      signalsIn: "{done} of {total} signals in",
      failed: "The scan stopped before it could finish",
    },
    subScores: {
      heading: "Score breakdown",
      pending: "Fetching",
      vsLast: "vs last scan",
      firstScan: "First scan",
      labels: {
        visibility: "Visibility",
        maps: "Google Maps",
        website: "Website SEO",
        "ai-search": "AI Search",
        reviews: "Reviews",
        conversion: "Conversion",
      },
    },
    opportunities: {
      heading: "Your Top 5 Opportunities",
      viewAll: "View All",
      pending: "Ranking your opportunities",
      pendingNote: "This runs last, because it uses everything the scan found.",
      empty: "No opportunities yet.",
      impact: { high: "High Impact", medium: "Medium", low: "Low" },
      estimatePrefix: "Est.",
      estimateSuffix: `extra ${labels.bookingPlural.toLowerCase()} a month`,
    },
    empty: {
      heading: "Nothing scanned yet",
      body: `Connect your tools and REYNAV will score your ${labels.business.toLowerCase()} and rank what to do next.`,
      cta: { href: "/onboarding", label: "Open setup" },
      scan: "Scan this location",
      starting: "Starting scan…",
    },
    steps: {
      "crawl-website": "Website health",
      "collect-demand": "Local search demand",
      "collect-rankings": "Google rankings",
      "collect-listing": "Business profile",
      "collect-reviews": "Reviews",
      "collect-competitors": "Nearby competitors",
      "collect-search-performance": "Search Console performance",
      "collect-bookings": "Traffic and bookings",
      "collect-ai-visibility": "AI search visibility",
      "compute-scores": "Growth Score",
      "explain-opportunities": "Opportunities",
      "build-growth-plan": "30-day growth plan",
    },
    /** {date} is filled in on the client. */
    nextScan: "Next automatic scan {date}",
    notifications: notificationsCopy(labels),
    history: {
      heading: "Growth Score history",
      empty: "Your history appears after your second scan.",
      /** {score} and {date} are filled in on the client. */
      pointLabel: "{score} on {date}",
    },
    recommended: {
      heading: "Recommended Today",
      intro: "Three quick moves from your biggest opportunities.",
      from: "For",
      markDone: "Mark as done",
      done: "Done",
      empty: "Nothing left for today — every open action is ticked off.",
      effort: { quick: "Quick win", medium: "Medium", project: "Project" },
    },
    scanning: {
      heading: `Scanning your ${labels.business.toLowerCase()}`,
      intro:
        "We're checking your website, search rankings, listing and bookings. Your Home fills in as soon as the first results land.",
      pill: "Scanning",
      /** {percent} is filled in on the client. */
      percent: "{percent}%",
      popoverHeading: "Scan in progress",
      status: { waiting: "Waiting", running: "Running", done: "Done", failed: "Failed" },
      /** {attempt} and {max} are filled in on the client. */
      retrying: "Retrying {attempt}/{max}",
      pollError: "Connection hiccup — still trying.",
    },
    simulatedNote: "Simulated scan data. Every number here came from the scoring functions, not from a live provider.",
  } as const;
}

export type DashboardCopy = ReturnType<typeof dashboardCopy>;
