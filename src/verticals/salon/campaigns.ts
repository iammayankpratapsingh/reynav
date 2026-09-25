// Salon pack: campaign templates REYNAV can recommend. Data only — which ones to surface is decided by
// the campaign service from scan results, never here.
import type { VerticalCampaignTemplate } from "@/shared/types/vertical";

export const campaigns: readonly VerticalCampaignTemplate[] = [
  {
    id: "service-push",
    name: "{service} {city} Campaign",
    summary: "3 Google posts + Instagram content + Landing page",
    /** Filled from the opportunity that triggered it. */
    trigger: "service-opportunity",
    segmentId: "regulars",
    pieces: ["3 Google posts", "Instagram content", "Landing page"],
    theme: "rose",
  },
  {
    id: "bridal-season",
    name: "Bridal Season Campaign",
    summary: "Target brides in your area",
    trigger: "segment",
    segmentId: "brides",
    pieces: ["Landing page", "2 Google posts", "Instagram reel"],
    theme: "blush",
  },
  {
    id: "back-to-school",
    name: "Back to School Special",
    summary: "Target students & families",
    trigger: "seasonal",
    segmentId: "students",
    pieces: ["Offer post", "Email send", "Instagram story"],
    theme: "amber",
  },
  {
    id: "treatment-awareness",
    name: "{service} Campaign",
    summary: "Increase visibility for {service} services",
    trigger: "service-opportunity",
    segmentId: "professionals",
    pieces: ["Service page", "3 Google posts", "FAQ block"],
    theme: "violet",
  },
  {
    id: "refer-a-friend",
    name: "Refer a Friend Program",
    summary: "Drive repeat bookings",
    trigger: "retention",
    segmentId: "regulars",
    pieces: ["Email sequence", "In-salon card", "Instagram post"],
    theme: "teal",
  },
  {
    id: "win-back",
    name: "Win Back Lapsed Clients",
    summary: "Reach clients who have not been in for six months",
    trigger: "retention",
    segmentId: "lapsed",
    pieces: ["Win-back email", "Offer post"],
    theme: "sky",
  },
];
