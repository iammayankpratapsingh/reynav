// Product copy for the opportunities screens; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function opportunitiesCopy(labels: VerticalLabels) {
  const bookings = labels.bookingPlural.toLowerCase();

  return {
    list: {
      title: "Opportunities",
      subtitle: "Ranked by what is most likely to bring you work, not by what is easiest to say.",
      scannedPrefix: "From your scan on",
      impact: { high: "High Impact", medium: "Medium", low: "Low" },
      searchesLabel: "searches / month",
      rankLabel: "You rank",
      unranked: "Not ranking",
      bookingsLabel: `est. ${bookings} / month`,
      revenueLabel: "est. revenue / month",
      difficulty: { easy: "Easy", medium: "Medium", hard: "Hard" },
      controls: {
        label: "Sort and filter opportunities",
        sort: "Sort by",
        sortOptions: {
          rank: "Best overall",
          revenue: "Revenue (highest)",
          difficulty: "Difficulty (easiest)",
          searches: "Search volume",
        },
        service: "Service",
        difficulty: "Difficulty",
        location: "Location",
        all: "All",
        other: "Not service-specific",
        /** {shown} and {total} are filled in on the client. */
        count: "{shown} of {total}",
        reset: "Reset",
        noMatch: "No opportunities match these filters.",
      },
      open: "Open",
      empty: {
        heading: "No opportunities yet",
        body: "Run a scan and REYNAV will rank what to do next by likely impact.",
        cta: { href: "/onboarding", label: "Start a scan" },
      },
    },
    detail: {
      back: "Back to Opportunities",
      highBadge: "High Opportunity",
      mediumBadge: "Medium Opportunity",
      lowBadge: "Low Opportunity",
      tabs: [
        { id: "overview", label: "Overview" },
        { id: "competitors", label: "Competitors" },
        { id: "content", label: "Content Plan" },
        { id: "tasks", label: "Tasks" },
      ],
      stats: {
        searches: "Estimated monthly searches",
        yourRank: "Your ranking",
        competitorRank: "Competitor ranking",
        missed: `Estimated missed ${bookings}`,
        revenue: "Potential monthly revenue",
        perMonth: "/ month",
        unranked: "Not ranking",
        unknown: "Not enough data",
      },
      quote: {
        attribution: "— REYNAV AI",
        estimateNote: "Figures are estimates shown as ranges.",
      },
      recommendation: {
        heading: "AI Recommendation",
        note: "Ticking these off is just for you — REYNAV does not publish anything without your approval.",
        effort: { quick: "Quick win", medium: "Medium", project: "Project" },
      },
      competitors: {
        heading: "Who is winning this search",
        ratingLabel: "rating",
        reviewsLabel: "reviews",
        positionLabel: "Avg. map position",
        outranks: "Ahead of you",
        behind: "Behind you",
        empty: "No competitor data for this opportunity.",
      },
      content: {
        heading: "Content that would move this",
        note: "Drafted in your voice in the Content section, ready for you to approve.",
        minutesSuffix: "min to draft",
        create: "Open in Content",
        empty: "No content pieces mapped to this opportunity yet.",
      },
      tasks: {
        heading: "Your task list",
        done: "done",
        remaining: "remaining",
        allDone: "Everything here is ticked off. Re-scan to see what changed.",
      },
    },
  } as const;
}

export type OpportunitiesCopy = ReturnType<typeof opportunitiesCopy>;
