// AI search visibility: whether AI answers name the business, per service and location, over time.

export const AI_SURFACES = ["google-ai-overview", "chat-assistant"] as const;

export type AiSurface = (typeof AI_SURFACES)[number];

export type AiVisibilityCheck = {
  prompt: string;
  serviceSlug: string | null;
  serviceName: string | null;
  locationLabel: string;
  surface: AiSurface;
  wasMentioned: boolean;
  /** Position within the answer's list of businesses, or null when not named. */
  position: number | null;
  namedCount: number;
};

/** One service (or the business type as a whole) in one location, across both surfaces. */
export type AiServiceVisibility = {
  key: string;
  serviceName: string | null;
  locationLabel: string;
  prompt: string;
  results: { surface: AiSurface; wasMentioned: boolean; position: number | null; namedCount: number }[];
  /** Surfaces that named the business last scan, or null when this is the first check. */
  previousMentions: number | null;
};

export type AiSearchHistoryPoint = {
  scanId: string;
  at: string;
  /** Share of checks that named the business, 0–100. Counted, not modelled. */
  mentionRate: number;
};

export type AiSearchBoard = {
  scanId: string | null;
  scannedAt: string | null;
  score: { value: number; previous: number | null } | null;
  bySurface: { surface: AiSurface; mentioned: number; total: number }[];
  services: AiServiceVisibility[];
  history: AiSearchHistoryPoint[];
};
