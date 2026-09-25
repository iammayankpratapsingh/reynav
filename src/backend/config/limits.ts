import "server-only";
// Rate limits and timings declared in one place, enforced by the job runner's throttle.

/** Requests per minute each provider tolerates. */
export const rateLimits = {
  searchDemand: 60,
  rankTracker: 30,
  aiVisibility: 12,
  localListing: 60,
  webCrawler: 20,
  webAnalytics: 60,
  bookingSource: 60,
  competitorDirectory: 30,
} as const;

/** Wait before retrying a failed scan step, doubled on each further attempt. */
export const stepRetryBaseMs = 1500;

/** No external call may wait indefinitely. */
export const timeoutsMs = {
  default: 15_000,
  crawl: 45_000,
  aiVisibility: 60_000,
} as const;

/**
 * How long each scan step takes while the mock providers are in use.
 * These stand in for the time a real scan spends queued behind a provider, and are the one knob to turn
 * when the simulation should feel faster or slower.
 */
export const stepDelays = {
  "crawl-website": 1800,
  "collect-demand": 1400,
  "collect-rankings": 2600,
  "collect-listing": 1600,
  "collect-reviews": 1300,
  "collect-competitors": 2400,
  "collect-search-performance": 1100,
  "collect-bookings": 1500,
  "collect-ai-visibility": 3200,
  "compute-scores": 900,
  "explain-opportunities": 2200,
  "build-growth-plan": 900,
} as const;
