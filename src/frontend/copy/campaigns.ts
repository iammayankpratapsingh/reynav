// Product copy for the campaigns screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function campaignsCopy(labels: VerticalLabels) {
  return {
    title: "Marketing Campaigns",
    subtitle: `Launch AI-recommended campaigns to get more ${labels.bookingPlural.toLowerCase()}.`,
    tabs: [
      { id: "recommended", label: "Recommended" },
      { id: "active", label: "Active" },
      { id: "past", label: "Past Campaigns" },
    ],
    impact: { high: "High Impact", medium: "Medium", low: "Low" },
    launch: "Launch",
    forLabel: "For",
    piecesLabel: "Includes",
    notWired: "Launching is not connected yet. Nothing is published without your approval.",
    empty: {
      active: {
        heading: "No campaigns running",
        body: "Launch one from the Recommended tab and it will show up here with its progress.",
      },
      past: {
        heading: "No past campaigns",
        body: "Once a campaign finishes, its results land here so you can see what it was worth.",
      },
      recommended: {
        heading: "No recommendations yet",
        body: "Run a scan and REYNAV will suggest the campaigns most likely to pay off.",
        cta: { href: "/onboarding", label: "Start a scan" },
      },
    },
    custom: {
      heading: "Need a custom campaign?",
      body: "Tell our AI what you have in mind and we'll create it for you.",
      cta: "Create with AI",
      placeholder: "e.g. a quiet-Tuesday offer for regulars",
    },
  } as const;
}

export type CampaignsCopy = ReturnType<typeof campaignsCopy>;
