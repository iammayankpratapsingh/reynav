// Competitor intelligence: the business and its nearby rivals side by side, as of one scan.

export type ServiceMapPosition = {
  serviceSlug: string;
  serviceName: string;
  /** Best map pack position across that service's keywords, or null when not showing. */
  mapPosition: number | null;
};

export type CompetitorProfile = {
  name: string;
  /** True for the business itself, so the same shape fills the "You" row. */
  isYou: boolean;
  websiteUrl: string | null;
  averageRating: number;
  reviewCount: number;
  reviewsLast30Days: number;
  reviewsPrevious30Days: number;
  averageMapPosition: number | null;
  services: string[];
  pageTopics: string[];
  pageCount: number;
  postsLast90Days: number;
  photoCount: number;
  mapPositions: ServiceMapPosition[];
};

/** One line of the changes feed, e.g. a rival adding reviews faster than you. Worded by the UI. */
export type CompetitorChange = {
  id: string;
  competitorName: string;
  metric: "reviews" | "posts" | "photos";
  theirs: number;
  yours: number;
};

/** A page topic rivals have that the business does not. */
export type MissingPage = {
  topic: string;
  competitorNames: string[];
};

export type CompetitorBoard = {
  scanId: string | null;
  scannedAt: string | null;
  locationLabel: string;
  you: CompetitorProfile | null;
  competitors: CompetitorProfile[];
  changes: CompetitorChange[];
  missingPages: MissingPage[];
};
