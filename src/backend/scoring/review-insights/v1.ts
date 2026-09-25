// Review insights: tone from the star rating, topics from the vertical's keyword lists, and rollups by staff
// member and topic. Pure and deterministic — no model is asked to count anything.
import type { ReviewSentiment } from "@/shared/types/review";

export const VERSION = "reviewInsights.v1";

export type TopicDefinition = { id: string; name: string; keywords: readonly string[] };

export function sentimentOfV1(rating: number): ReviewSentiment {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "neutral";
}

/** Topic ids whose keywords appear in the text, in the order the vertical lists them. */
export function topicsOfV1(text: string, topics: readonly TopicDefinition[]): string[] {
  const lower = text.toLowerCase();
  return topics.filter((topic) => topic.keywords.some((keyword) => lower.includes(keyword))).map((topic) => topic.id);
}

export type RatedReview = { rating: number; staffName: string | null; topicIds: readonly string[] };

export function staffBreakdownV1(
  reviews: readonly RatedReview[],
): { staffName: string; averageRating: number; reviewCount: number }[] {
  const byStaff = new Map<string, number[]>();
  for (const review of reviews) {
    if (!review.staffName) continue;
    byStaff.set(review.staffName, [...(byStaff.get(review.staffName) ?? []), review.rating]);
  }
  return [...byStaff.entries()]
    .map(([staffName, ratings]) => ({
      staffName,
      averageRating: Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10,
      reviewCount: ratings.length,
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount || b.averageRating - a.averageRating);
}

export function topicBreakdownV1(
  reviews: readonly RatedReview[],
  topics: readonly TopicDefinition[],
): { id: string; name: string; mentions: number; positive: number; negative: number }[] {
  return topics
    .map((topic) => {
      const mentioning = reviews.filter((review) => review.topicIds.includes(topic.id));
      return {
        id: topic.id,
        name: topic.name,
        mentions: mentioning.length,
        positive: mentioning.filter((review) => sentimentOfV1(review.rating) === "positive").length,
        negative: mentioning.filter((review) => sentimentOfV1(review.rating) === "negative").length,
      };
    })
    .filter((topic) => topic.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions);
}
