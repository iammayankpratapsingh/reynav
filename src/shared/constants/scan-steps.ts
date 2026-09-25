// Scan step names and statuses (waiting, running, done, failed).

/** In the order the scan runs them. */
export const SCAN_STEPS = [
  "crawl-website",
  "collect-demand",
  "collect-rankings",
  "collect-listing",
  "collect-reviews",
  "collect-competitors",
  "collect-search-performance",
  "collect-bookings",
  "collect-ai-visibility",
  "compute-scores",
  "explain-opportunities",
  "build-growth-plan",
] as const;

/** How many times a failed step is tried in total before the scan gives up on it. */
export const MAX_STEP_ATTEMPTS = 3;

export type ScanStepId = (typeof SCAN_STEPS)[number];

export const SCAN_STEP_STATUSES = ["waiting", "running", "done", "failed"] as const;

export type ScanStepStatus = (typeof SCAN_STEP_STATUSES)[number];
