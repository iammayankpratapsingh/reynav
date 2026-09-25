// Product copy for the reports screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function reportsCopy(labels: VerticalLabels) {
  return {
    title: "Reports",
    subtitle: "One summary for every completed scan, ready to read or send on.",
    derivedNote:
      "Reports are built from your stored scan results. Set up the weekly email in Settings.",
    report: {
      scorePrefix: "Growth Score",
      outOf: "/100",
      sinceLast: "vs previous",
      firstReport: "First report",
      highlightsHeading: "Score movement",
      opportunitiesHeading: "Top opportunities this period",
      estimatePrefix: "Best opportunity worth an estimated",
      estimateSuffix: `extra ${labels.bookingPlural.toLowerCase()} a month`,
      download: "Download PDF",
      notWired: "Downloads are not connected yet.",
      generatedPrefix: "Generated",
    },
    empty: {
      heading: "No reports yet",
      body: "A report is written every time a scan finishes. Run your first one to get started.",
      cta: { href: "/onboarding", label: "Start a scan" },
    },
  } as const;
}

export type ReportsCopy = ReturnType<typeof reportsCopy>;
