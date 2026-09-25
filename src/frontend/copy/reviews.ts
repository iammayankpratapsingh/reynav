// Product copy for the reviews screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function reviewsCopy(labels: VerticalLabels) {
  return {
    title: "Reviews",
    subtitle: `Your reputation drives more ${labels.bookingPlural.toLowerCase()}.`,
    summary: {
      rating: "Average Rating",
      total: "Total Reviews",
      growth: "vs last 3 months",
      replyRate: "Replied to",
    },
    byService: {
      heading: "Reviews by Service",
      countSuffix: "reviews",
      empty: "No per-service breakdown yet.",
    },
    tabs: [
      { id: "recent", label: "All reviews" },
      { id: "unanswered", label: "Unanswered" },
      { id: "negative", label: "Negative" },
    ],
    insights: {
      sentimentHeading: "Tone of recent reviews",
      sentiment: { positive: "Positive", neutral: "Neutral", negative: "Negative" },
      topicsHeading: "What customers talk about",
      /** {mentions}, {positive} and {negative} are filled in on the client. */
      topicLine: "{mentions} mentions · {positive} positive · {negative} negative",
      topicsEmpty: "No recurring topics yet.",
      staffHeading: `Rating by ${labels.staffMember.toLowerCase()}`,
      staffCount: "reviews",
      staffEmpty: `No reviews name a ${labels.staffMember.toLowerCase()} yet.`,
      lowHeading: "Services with few reviews",
      lowIntro: "Ask clients of these services for a review — it's the fastest way to rank for them.",
      /** {count} is filled in on the client. */
      lowCount: "{count} reviews",
      lowSearches: "searches / mo",
      lowEmpty: "Every service has a healthy number of reviews.",
      noneInTab: "Nothing here.",
    },
    review: {
      generate: "Generate AI Response",
      reply: "Reply",
      replied: "Replied",
      yourReply: "Your reply",
      suggestedReply: "Suggested reply",
      use: "Use this reply",
      edit: "Edit",
      notWired: "Publishing replies is not connected yet — nothing is sent without your approval.",
      ratingLabel: "out of 5",
      awaitingPrefix: "",
      awaitingSuffix: "reviews are waiting for a reply.",
      allAnswered: "Every review has a reply. Nicely done.",
    },
    empty: {
      heading: "No reviews yet",
      body: "Connect your Google Business Profile and REYNAV will pull your reviews in.",
      cta: { href: "/onboarding", label: "Connect your profile" },
    },
  } as const;
}

export type ReviewsCopy = ReturnType<typeof reviewsCopy>;
