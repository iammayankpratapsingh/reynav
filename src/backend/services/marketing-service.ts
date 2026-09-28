import "server-only";
// Public marketing content: neutral business labels for the public pages, plus the featured vertical's imagery.
import { marketingLabels } from "@/shared/constants/marketing-labels";
import type { LandingContent } from "@/shared/types/marketing";
import type { VerticalLabels } from "@/shared/types/vertical";
import { featuredVerticalId, getVertical } from "@/verticals";

export function getLandingContent(): LandingContent {
  const pack = getVertical(featuredVerticalId);
  return { labels: marketingLabels, heroImage: pack.marketing.heroImage };
}

export function getMarketingLabels(): VerticalLabels {
  return marketingLabels;
}
