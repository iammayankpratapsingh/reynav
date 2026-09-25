// Salon pack: what clients talk about in reviews, and the words that give it away.
import type { VerticalReviewTopic } from "@/shared/types/vertical";

export const reviewTopics: readonly VerticalReviewTopic[] = [
  { id: "results", name: "Results", keywords: ["results", "looks great", "natural", "perfect", "stunning", "brand new", "lasted", "best"] },
  { id: "staff", name: "Staff & service", keywords: ["friendly", "professional", "listened", "patient", "explained", "talented", "magician", "gentle"] },
  { id: "wait-time", name: "Wait time", keywords: ["waited", "longer than", "late", "rushed", "minutes past"] },
  { id: "booking", name: "Booking", keywords: ["booking", "booked", "reach by phone", "called me back", "double-booked"] },
  { id: "price", name: "Price & value", keywords: ["price", "pricey", "value", "worth", "expensive", "cheap"] },
  { id: "cleanliness", name: "Cleanliness", keywords: ["clean", "spotless", "messy", "hygiene"] },
];
