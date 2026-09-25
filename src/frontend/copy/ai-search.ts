// Product copy for the AI search screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function aiSearchCopy(labels: VerticalLabels) {
  return {
    title: "AI Search",
    subtitle: `Whether Google's AI Overview and AI assistants recommend your ${labels.business.toLowerCase()} when people ask.`,
    scannedPrefix: "From your scan on",
    score: { label: "AI Search score", outOf: "/100", vsLast: "vs last scan", first: "First check" },
    surfaces: { "google-ai-overview": "Google AI Overview", "chat-assistant": "AI assistants" },
    /** {mentioned} and {total} are filled in on the client. */
    surfaceLine: "Named in {mentioned} of {total} answers",
    table: {
      heading: "By service and location",
      intro: "The questions we asked, and whether each AI answer named you.",
      caption: "AI answers by service, location and surface",
      question: "Question",
      service: "Service",
      location: "Location",
      general: `Any ${labels.business.toLowerCase()}`,
      mentioned: "Named #{position} of {count}",
      notMentioned: "Not named",
      trend: "vs last scan",
      /** {now} and {before} are filled in on the client. */
      trendLine: "{now} of {total} (was {before})",
      firstCheck: "First check",
    },
    history: {
      heading: "Mention rate over time",
      intro: "Share of AI answers that named you, scan by scan.",
    },
    empty: {
      heading: "No AI answers checked yet",
      body: "Your next scan asks Google's AI Overview and AI assistants the questions your customers ask.",
      cta: { href: "/dashboard", label: "Go to Home" },
    },
    simulatedNote: "Simulated AI answers while providers are mocked.",
  } as const;
}

export type AiSearchCopy = ReturnType<typeof aiSearchCopy>;
