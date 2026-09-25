import "server-only";
// Reviews: the listing's reputation, broken down by service, staff member, tone and topic, plus the services
// customers rarely review and a suggested reply for anything unanswered.
// Service and topic words come from the vertical pack and the owner's service list, never from this file.
import { getLocalListingSource } from "@/backend/adapters/local-listing";
import type { ListingReview } from "@/backend/adapters/local-listing/types";
import * as scansRepository from "@/backend/db/repositories/scans";
import * as servicesRepository from "@/backend/db/repositories/services";
import { sentimentOfV1, staffBreakdownV1, topicBreakdownV1, topicsOfV1 } from "@/backend/scoring/review-insights/v1";
import type { LowReviewService, ReviewBoard, ReviewSentiment } from "@/shared/types/review";
import type { TenantContext } from "@/shared/types/tenant";
import { getVertical } from "@/verticals";
import { requirePrimaryBusiness, requirePrimaryLocation } from "./onboarding-service";
import { getWorkspace } from "./organization-service";
import { resolveServices } from "./scan-steps/scan-context";

const FEED_LIMIT = 50;
const RECENT_WINDOW = 20;

export async function getBoard(ctx: TenantContext): Promise<ReviewBoard> {
  const [workspace, business, location] = await Promise.all([
    getWorkspace(ctx),
    requirePrimaryBusiness(ctx),
    requirePrimaryLocation(ctx),
  ]);

  const pack = getVertical(workspace.verticalId);
  const services = resolveServices(business.profile?.services ?? null, pack);
  const nameOf = new Map(services.map((service) => [service.slug, service.name]));
  for (const service of pack.services) if (!nameOf.has(service.slug)) nameOf.set(service.slug, service.name);
  const serviceName = (slug: string | null) => (slug === null ? null : (nameOf.get(slug) ?? null));

  const source = getLocalListingSource();
  const [snapshot, feed, searches] = await Promise.all([
    source.getSnapshot({ locationRef: location.id }),
    source.getReviews({ locationRef: location.id, limit: FEED_LIMIT }),
    latestServiceSearches(ctx),
  ]);

  const rated = feed.reviews.map((review) => ({
    review,
    sentiment: sentimentOfV1(review.rating),
    topicIds: topicsOfV1(review.text, pack.reviewTopics),
  }));
  const topicName = new Map(pack.reviewTopics.map((topic) => [topic.id, topic.name]));

  const sentiment: Record<ReviewSentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  for (const row of rated) sentiment[row.sentiment] += 1;

  const reviewCountBySlug = new Map(feed.byService.map((row) => [row.serviceSlug, row.reviewCount]));
  const lowReviewServices: LowReviewService[] = services
    .map((service) => ({
      serviceName: service.name,
      reviewCount: reviewCountBySlug.get(service.slug) ?? 0,
      monthlySearches: searches.get(service.slug) ?? null,
    }))
    .filter((row) => row.reviewCount < pack.benchmarks.services.minServiceReviews)
    .sort((a, b) => (b.monthlySearches ?? 0) - (a.monthlySearches ?? 0));

  return {
    summary: {
      averageRating: snapshot.averageRating,
      totalReviews: snapshot.reviewCount,
      growthPercent: feed.growthPercent,
      replyRate: snapshot.replyRate,
    },
    byService: feed.byService.flatMap((row) => {
      const name = serviceName(row.serviceSlug);
      return name
        ? [
            {
              serviceSlug: row.serviceSlug,
              serviceName: name,
              averageRating: row.averageRating,
              reviewCount: row.reviewCount,
            },
          ]
        : [];
    }),
    byStaff: staffBreakdownV1(
      rated.map(({ review, topicIds }) => ({ rating: review.rating, staffName: review.staffName, topicIds })),
    ),
    sentiment,
    topics: topicBreakdownV1(
      rated.map(({ review, topicIds }) => ({ rating: review.rating, staffName: review.staffName, topicIds })),
      pack.reviewTopics,
    ),
    lowReviewServices,
    reviews: rated.map(({ review, sentiment: tone, topicIds }) => ({
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      text: review.text,
      postedAt: review.postedAt,
      serviceName: serviceName(review.serviceSlug),
      staffName: review.staffName,
      sentiment: tone,
      topics: topicIds.map((id) => topicName.get(id) ?? id),
      reply: review.reply,
      suggestedReply: review.reply ? null : draftReply(review, serviceName(review.serviceSlug)),
    })),
    awaitingReply: feed.reviews.filter((review) => review.reply === null).length,
  };
}

/** Monthly searches per service from the latest scan that measured services. */
async function latestServiceSearches(ctx: TenantContext): Promise<Map<string, number | null>> {
  for (const scan of await scansRepository.listRecent(ctx, RECENT_WINDOW)) {
    const metrics = await servicesRepository.listMetricsForScan(ctx, scan.id);
    if (metrics.length > 0) return new Map(metrics.map((metric) => [metric.serviceSlug, metric.monthlySearches]));
  }
  return new Map();
}

/**
 * A stand-in for the LanguageModel adapter, which is not wired yet. It is deliberately simple and obvious:
 * when the model is connected this whole function is replaced by a prompt, and nothing else changes.
 */
function draftReply(review: ListingReview, service: string | null): string {
  const about = service ? ` about your ${service.toLowerCase()}` : "";
  const staff = review.staffName ? ` We'll pass this on to ${review.staffName}.` : "";

  if (review.rating >= 4) {
    return `Thank you so much for the kind words${about}!${staff} We loved having you in and cannot wait to see you again.`;
  }
  return `Thank you for the honest feedback${about}. We are sorry it was not quite right — please reach out so we can put it right on your next visit.`;
}
