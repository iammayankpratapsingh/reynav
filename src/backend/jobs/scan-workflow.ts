import "server-only";
// The scan workflow. Each step is idempotent, records its own status and returns nothing but its effect on
// the database, so the UI can show progress and a retry is always safe.
import * as scansRepository from "@/backend/db/repositories/scans";
import * as scanStepsRepository from "@/backend/db/repositories/scan-steps";
import { logger } from "@/backend/lib/logger";
import { buildGrowthPlan } from "@/backend/services/scan-steps/build-growth-plan";
import { collectAiVisibility } from "@/backend/services/scan-steps/collect-ai-visibility";
import { collectBookings } from "@/backend/services/scan-steps/collect-bookings";
import { collectCompetitors } from "@/backend/services/scan-steps/collect-competitors";
import { collectDemand } from "@/backend/services/scan-steps/collect-demand";
import { collectListing } from "@/backend/services/scan-steps/collect-listing";
import { collectRankings } from "@/backend/services/scan-steps/collect-rankings";
import { collectReviews } from "@/backend/services/scan-steps/collect-reviews";
import { collectSearchPerformance } from "@/backend/services/scan-steps/collect-search-performance";
import { computeScores } from "@/backend/services/scan-steps/compute-scores";
import { crawlWebsite } from "@/backend/services/scan-steps/crawl-website";
import { explainOpportunities } from "@/backend/services/scan-steps/explain-opportunities";
import { buildScanContext, type ScanContext } from "@/backend/services/scan-steps/scan-context";
import { clearSignals } from "@/backend/services/scan-steps/step-store";
import { stepDelays, stepRetryBaseMs } from "@/backend/config/limits";
import type { Role } from "@/shared/constants/roles";
import { MAX_STEP_ATTEMPTS, type ScanStepId } from "@/shared/constants/scan-steps";
import type { TenantContext } from "@/shared/types/tenant";
import type { ScanRequestedPayload } from "./events";

type Step = { id: ScanStepId; run: (scan: ScanContext) => Promise<void> };

/**
 * Order matters: the website and demand land first because they are quick and unblock the rest;
 * competitors need the listing, website and rankings for the "You" row; scores need every sub-score,
 * so they go last but one.
 */
const STEPS: readonly Step[] = [
  { id: "crawl-website", run: crawlWebsite },
  { id: "collect-demand", run: collectDemand },
  { id: "collect-rankings", run: collectRankings },
  { id: "collect-listing", run: collectListing },
  { id: "collect-reviews", run: collectReviews },
  { id: "collect-competitors", run: collectCompetitors },
  { id: "collect-search-performance", run: collectSearchPerformance },
  { id: "collect-bookings", run: collectBookings },
  { id: "collect-ai-visibility", run: collectAiVisibility },
  { id: "compute-scores", run: computeScores },
  { id: "explain-opportunities", run: explainOpportunities },
  { id: "build-growth-plan", run: buildGrowthPlan },
];

export async function runScan(payload: ScanRequestedPayload): Promise<void> {
  const ctx: TenantContext = {
    organizationId: payload.organizationId,
    userId: payload.userId,
    role: payload.role as Role,
    locationId: payload.locationId,
  };

  const scan = await buildScanContext(ctx, payload.scanId);
  await scansRepository.setStatus(ctx, payload.scanId, "running", null);
  const startedAt = Date.now();

  let failed = false;
  for (const step of STEPS) {
    await scanStepsRepository.markRunning(ctx, payload.scanId, step.id);
    // Providers are throttled; the delay is what a real scan spends waiting on them.
    await wait(stepDelays[step.id]);

    const errorCode = await runWithRetry(ctx, payload.scanId, step, scan);
    if (errorCode === null) {
      await scanStepsRepository.markDone(ctx, payload.scanId, step.id);
      continue;
    }
    failed = true;
    await scanStepsRepository.markFailed(ctx, payload.scanId, step.id, errorCode);
    logger.error({
      message: "scan step failed after retries",
      organizationId: ctx.organizationId,
      scanId: payload.scanId,
      step: step.id,
      code: errorCode,
    });
    break;
  }

  await scansRepository.setStatus(ctx, payload.scanId, failed ? "failed" : "done", new Date().toISOString());
  clearSignals(payload.scanId);
  logger.info({
    message: failed ? "scan failed" : "scan finished",
    organizationId: ctx.organizationId,
    scanId: payload.scanId,
    durationMs: Date.now() - startedAt,
  });
}

/**
 * Tries a step up to MAX_STEP_ATTEMPTS times with a doubling pause, recording each retry so the UI can show
 * it. Steps are idempotent, so running one again is always safe. Returns null on success, else the last error.
 */
async function runWithRetry(ctx: TenantContext, scanId: string, step: Step, scan: ScanContext): Promise<string | null> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await step.run(scan);
      return null;
    } catch (error) {
      const code = error instanceof Error ? error.name : "unknown";
      if (attempt >= MAX_STEP_ATTEMPTS) return code;
      await scanStepsRepository.markRetrying(ctx, scanId, step.id, code);
      logger.warn({
        message: "scan step retrying",
        organizationId: ctx.organizationId,
        scanId,
        step: step.id,
        code,
        attempt,
      });
      await wait(stepRetryBaseMs * 2 ** (attempt - 1));
    }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
