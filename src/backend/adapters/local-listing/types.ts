import "server-only";
// LocalListingSource: what the business's local listing says about it, and what customers have said back.
import type { PostalAddress } from "@/shared/types/business";

export type ListingSnapshot = {
  name: string;
  /** The address the listing shows, or null for a service-area business with no public address. */
  address: PostalAddress | null;
  hasCompleteHours: boolean;
  hasPrimaryCategory: boolean;
  hasDescription: boolean;
  photoCount: number;
  serviceCount: number;
  postsLast90Days: number;
  averageRating: number;
  reviewCount: number;
  reviewsLast90Days: number;
  reviewsLast30Days: number;
  /** Share of reviews the business has replied to, 0–1. */
  replyRate: number;
  source: string;
  fetchedAt: Date;
};

/** One review as the product understands it. No reviewer contact details ever cross this boundary. */
export type ListingReview = {
  id: string;
  /** Display name as the provider shows it publicly, e.g. "Priya S." */
  authorName: string;
  rating: number;
  text: string;
  postedAt: string; // ISO 8601
  /** The service the review is about, when the provider or our matching can tell. */
  serviceSlug: string | null;
  /** The staff member the review names, when the provider or our matching can tell. */
  staffName: string | null;
  /** The reply already published, when there is one. */
  reply: string | null;
};

export type ServiceRating = {
  serviceSlug: string;
  averageRating: number;
  reviewCount: number;
};

export type ReviewFeed = {
  reviews: ListingReview[];
  byService: ServiceRating[];
  /** Change in review count against the previous three months, as a percentage. */
  growthPercent: number;
  source: string;
  fetchedAt: Date;
};

export interface LocalListingSource {
  getSnapshot(input: { locationRef: string }): Promise<ListingSnapshot>;
  getReviews(input: { locationRef: string; limit: number }): Promise<ReviewFeed>;
}
