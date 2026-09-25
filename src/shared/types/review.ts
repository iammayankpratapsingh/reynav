// Review domain types for the reviews screen.

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  /** Change against the previous three months, as a percentage. */
  growthPercent: number;
  /** Share of reviews that have a reply, 0–1. */
  replyRate: number;
};

export type ServiceReviewBreakdown = {
  serviceSlug: string;
  /** Display name from the vertical pack. */
  serviceName: string;
  averageRating: number;
  reviewCount: number;
};

export type ReviewSentiment = "positive" | "neutral" | "negative";

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  postedAt: string;
  serviceName: string | null;
  staffName: string | null;
  sentiment: ReviewSentiment;
  /** Topic names the review talks about, from the vertical's topic list. */
  topics: string[];
  reply: string | null;
  /** A reply REYNAV would suggest. Written by the language model, never a number. */
  suggestedReply: string | null;
};

export type StaffReviewBreakdown = {
  staffName: string;
  averageRating: number;
  reviewCount: number;
};

export type TopicInsight = {
  id: string;
  name: string;
  mentions: number;
  positive: number;
  negative: number;
};

/** A service customers rarely review, which is an opportunity to ask for more. */
export type LowReviewService = {
  serviceName: string;
  reviewCount: number;
  monthlySearches: number | null;
};

export type ReviewBoard = {
  summary: ReviewSummary;
  byService: ServiceReviewBreakdown[];
  byStaff: StaffReviewBreakdown[];
  sentiment: Record<ReviewSentiment, number>;
  topics: TopicInsight[];
  lowReviewServices: LowReviewService[];
  reviews: Review[];
  /** Reviews with no reply yet, which is what the suggestions tab works through. */
  awaitingReply: number;
};
