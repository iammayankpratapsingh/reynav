import "server-only";
// Public marketing content: resolves the featured vertical's labels and imagery for the public pages.
import type { LandingContent } from "@/shared/types/marketing";
import type { VerticalLabels } from "@/shared/types/vertical";
import { featuredVerticalId, getVertical } from "@/verticals";

export function getLandingContent(): LandingContent {
  const pack = getVertical(featuredVerticalId);
  return { labels: pack.manifest.labels, heroImage: pack.marketing.heroImage };
}

export function getMarketingLabels(): VerticalLabels {
  return getVertical(featuredVerticalId).manifest.labels;
}
