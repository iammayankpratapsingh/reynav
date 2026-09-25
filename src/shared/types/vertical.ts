// VerticalPack type every vertical must satisfy.

export type VerticalLabels = {
  business: string;
  businessPlural: string;
  staffMember: string;
  customerPlural: string;
  bookingPlural: string;
};

/** A kind of business inside the vertical, offered in onboarding and guessed from the website. */
export type VerticalBusinessType = {
  id: string;
  name: string;
  /** Lower-case words that suggest this type when they appear on the website. */
  keywords: readonly string[];
};

export type VerticalManifest = {
  id: string;
  displayName: string;
  labels: VerticalLabels;
  /** The first entry is the default when the website gives no clue. */
  businessTypes: readonly VerticalBusinessType[];
};

export type VerticalImage = {
  src: string;
  alt: string;
};

export type VerticalMarketing = {
  heroImage: VerticalImage;
};

/**
 * Every threshold the scoring functions take as a parameter. Scoring imports none of this directly;
 * services read the pack and pass the relevant part in.
 */
export type VerticalBenchmarks = {
  searchVisibility: { targetPosition: number; floorPosition: number };
  listing: {
    photoTarget: number;
    serviceTarget: number;
    postsTarget: number;
    mapTargetPosition: number;
    mapFloorPosition: number;
  };
  website: { fastLoadMs: number; slowLoadMs: number; servicePageTarget: number };
  aiVisibility: { prominentPosition: number };
  reviews: { targetRating: number; floorRating: number; reviewCountTarget: number; recentReviewTarget: number };
  conversion: { targetBookingRate: number; poorBounceRate: number };
  opportunity: { highDemandVolume: number; floorPosition: number; highImpact: number; mediumImpact: number };
  /** Average value of one booking, used for revenue estimates. */
  averageBookingValue: number;
  /** Defaults for services the pack does not know, and thresholds for the service screens. */
  services: {
    defaultMinutes: number;
    defaultMarginPercent: number;
    /** Monthly searches from which a service counts as in demand. */
    inDemandSearches: number;
    /** Reviews mentioning a service below which it counts as under-reviewed. */
    minServiceReviews: number;
  };
};

export type VerticalService = {
  slug: string;
  name: string;
  aliases: readonly string[];
  /** 1 is the service the vertical sells most. Used to decide what to check first. */
  priority: number;
  /** Typical price, used until the owner enters their own. */
  typicalPrice: number;
  typicalMinutes: number;
};

export type VerticalKeywords = {
  templates: readonly string[];
  brandTemplates: readonly string[];
  aiPromptTemplates: readonly string[];
};

export const CONTENT_CHANNELS = ["website", "google", "social", "email"] as const;

export type ContentChannel = (typeof CONTENT_CHANNELS)[number];

export type VerticalContentType = {
  id: string;
  channel: ContentChannel;
  name: string;
  description: string;
  /** Names a shape the UI knows how to draw; never a file path. */
  icon: string;
  estimatedMinutes: number;
};

export type VerticalSegment = {
  id: string;
  name: string;
  description: string;
};

export type VerticalCampaignTemplate = {
  id: string;
  /** May contain {service} and {city}, filled in from the scan. */
  name: string;
  summary: string;
  trigger: "service-opportunity" | "segment" | "seasonal" | "retention";
  segmentId: string;
  pieces: readonly string[];
  /** A tint name the UI maps to a gradient, so no photography is needed. */
  theme: string;
};

/** Something customers talk about in reviews, found by keywords. */
export type VerticalReviewTopic = {
  id: string;
  name: string;
  keywords: readonly string[];
};

/** One day's task in a growth-plan week. {service} and {city} are filled in from the week's focus. */
export type VerticalPlanTask = {
  id: string;
  label: string;
  effort: "quick" | "medium" | "project";
};

export type VerticalPack = {
  manifest: VerticalManifest;
  marketing: VerticalMarketing;
  benchmarks: VerticalBenchmarks;
  services: readonly VerticalService[];
  keywords: VerticalKeywords;
  contentTypes: readonly VerticalContentType[];
  segments: readonly VerticalSegment[];
  campaigns: readonly VerticalCampaignTemplate[];
  reviewTopics: readonly VerticalReviewTopic[];
  /** Seven tasks, one per day, repeated for each focus week of the 30-day plan. */
  planTasks: readonly VerticalPlanTask[];
};
