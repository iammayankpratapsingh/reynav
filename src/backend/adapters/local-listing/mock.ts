import "server-only";
// Mock LocalListingSource: a deterministic snapshot of a listing with obvious room to improve, plus a
// review feed. Service slugs match the salon pack so the per-service breakdown lines up.
import type { ListingReview, ListingSnapshot, LocalListingSource, ReviewFeed } from "./types";

export class MockLocalListing implements LocalListingSource {
  async getSnapshot(): Promise<ListingSnapshot> {
    return {
      name: "Primary location",
      address: { street: "25 Peel Centre Dr", city: "Brampton", region: "ON", postalCode: "L6T 3R5" },
      hasCompleteHours: true,
      hasPrimaryCategory: true,
      hasDescription: true,
      photoCount: 22,
      serviceCount: 9,
      postsLast90Days: 4,
      averageRating: 4.7,
      reviewCount: 128,
      reviewsLast90Days: 17,
      reviewsLast30Days: 4,
      replyRate: 0.92,
      source: "mock",
      fetchedAt: new Date(),
    };
  }

  async getReviews({ limit }: { limit: number }): Promise<ReviewFeed> {
    const fetchedAt = new Date();
    const reviews = seedReviews
      .slice(0, limit)
      .map(({ daysAgo: age, ...review }) => ({ ...review, postedAt: daysAgo(age) }));
    return {
      reviews,
      byService: [
        { serviceSlug: "haircut", averageRating: 4.9, reviewCount: 68 },
        { serviceSlug: "balayage", averageRating: 4.8, reviewCount: 42 },
        { serviceSlug: "bridal-makeup", averageRating: 4.7, reviewCount: 38 },
        { serviceSlug: "hair-colour", averageRating: 4.6, reviewCount: 22 },
        { serviceSlug: "keratin-treatment", averageRating: 4.8, reviewCount: 18 },
        { serviceSlug: "threading", averageRating: 4.9, reviewCount: 6 },
        { serviceSlug: "waxing", averageRating: 4.8, reviewCount: 4 },
        { serviceSlug: "hair-extensions", averageRating: 4.9, reviewCount: 3 },
      ],
      growthPercent: 32,
      source: "mock",
      fetchedAt,
    };
  }
}

/** Dates are relative to read time so the feed never looks stale. */
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

type SeedReview = Omit<ListingReview, "postedAt"> & { daysAgo: number };

const seedReviews: readonly SeedReview[] = [
  { id: "rev-1", authorName: "Priya S.", rating: 5, text: "Amazing balayage! Loved the results. Neha is so professional and friendly.", daysAgo: 2, serviceSlug: "balayage", staffName: "Neha", reply: null },
  { id: "rev-2", authorName: "Danielle R.", rating: 5, text: "Best haircut I have had in years. Aman actually listened to what I wanted.", daysAgo: 5, serviceSlug: "haircut", staffName: "Aman", reply: "Thank you Danielle! We are so glad you love it — see you next time." },
  { id: "rev-3", authorName: "Amrit K.", rating: 4, text: "Lovely colour work and a nice atmosphere. Took a little longer than booked.", daysAgo: 9, serviceSlug: "hair-colour", staffName: "Neha", reply: null },
  { id: "rev-4", authorName: "Sofia M.", rating: 5, text: "Simran did my bridal makeup and it lasted the entire day. Could not recommend more.", daysAgo: 14, serviceSlug: "bridal-makeup", staffName: "Simran", reply: "Congratulations again Sofia! It was a joy to be part of your day." },
  { id: "rev-5", authorName: "Jenna T.", rating: 3, text: "The keratin treatment was good but reception was hard to reach by phone.", daysAgo: 21, serviceSlug: "keratin-treatment", staffName: null, reply: null },
  { id: "rev-6", authorName: "Hana B.", rating: 5, text: "Walked out feeling brand new. Aman explained every step. Great value for the price.", daysAgo: 28, serviceSlug: "haircut", staffName: "Aman", reply: null },
  { id: "rev-7", authorName: "Rupinder G.", rating: 2, text: "Waited 25 minutes past my appointment time and the booking system double-booked me.", daysAgo: 31, serviceSlug: "haircut", staffName: null, reply: null },
  { id: "rev-8", authorName: "Meera P.", rating: 5, text: "Threading was quick and painless. Clean salon and very friendly staff.", daysAgo: 35, serviceSlug: "threading", staffName: "Kiran", reply: "Thanks Meera, see you soon!" },
  { id: "rev-9", authorName: "Laura C.", rating: 4, text: "Balayage looks great, a bit pricey but worth it. Neha is talented.", daysAgo: 40, serviceSlug: "balayage", staffName: "Neha", reply: null },
  { id: "rev-10", authorName: "Tanvi R.", rating: 5, text: "Simran is a magician with makeup. Booked her for my sister's wedding too.", daysAgo: 44, serviceSlug: "bridal-makeup", staffName: "Simran", reply: "We love this! Thank you Tanvi." },
  { id: "rev-11", authorName: "Grace L.", rating: 3, text: "Haircut was fine but the salon felt rushed and a little messy on a Saturday.", daysAgo: 49, serviceSlug: "haircut", staffName: "Jordan", reply: null },
  { id: "rev-12", authorName: "Harleen D.", rating: 5, text: "Kiran did my waxing — quick, gentle and professional. Spotless room.", daysAgo: 55, serviceSlug: "waxing", staffName: "Kiran", reply: null },
  { id: "rev-13", authorName: "Emily W.", rating: 1, text: "Colour came out brassy and nobody called me back about fixing it.", daysAgo: 60, serviceSlug: "hair-colour", staffName: "Jordan", reply: null },
  { id: "rev-14", authorName: "Nisha A.", rating: 5, text: "Extensions look so natural. Neha matched the colour perfectly.", daysAgo: 66, serviceSlug: "hair-extensions", staffName: "Neha", reply: "Thank you Nisha — they look stunning on you!" },
  { id: "rev-15", authorName: "Olivia F.", rating: 4, text: "Friendly staff and easy online booking. Parking can be tricky.", daysAgo: 72, serviceSlug: null, staffName: null, reply: null },
  { id: "rev-16", authorName: "Sana Q.", rating: 5, text: "Aman gave my son his best haircut ever. Great with kids and very patient.", daysAgo: 80, serviceSlug: "haircut", staffName: "Aman", reply: null },
];
