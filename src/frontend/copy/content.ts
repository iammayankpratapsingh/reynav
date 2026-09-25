// Product copy for the content screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function contentCopy(labels: VerticalLabels) {
  const business = labels.business.toLowerCase();

  return {
    title: "AI Content Engine",
    subtitle: `Create high-quality, ${business}-specific content in minutes.`,
    channels: {
      website: "Website",
      google: "Google",
      social: "Social",
      email: "Email",
    },
    suggested: "Suggested",
    suggestedForPrefix: "For",
    suggestedBanner: {
      one: "1 piece is suggested by your latest scan.",
      manyPrefix: "",
      manySuffix: "pieces are suggested by your latest scan.",
    },
    minutesSuffix: "min",
    selectHint: "Pick a piece to draft",
    selectedPrefix: "Selected:",
    generate: "Generate with AI",
    generating: "Drafting…",
    notWired: "Drafting is not connected yet. Selecting a piece shows what REYNAV would write for you.",
    empty: {
      heading: "No content types yet",
      body: "This vertical pack has no content types defined.",
    },
  } as const;
}

export type ContentCopy = ReturnType<typeof contentCopy>;
