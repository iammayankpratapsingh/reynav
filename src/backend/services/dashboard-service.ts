import "server-only";
// Reads stored scan results. It never computes a score: scoring ran during the scan and the numbers are
// already in the database. Parts that have not been written yet come back null, so the screen can show
// what has landed and keep waiting for the rest.
import * as opportunitiesRepository from "@/backend/db/repositories/opportunities";
import * as scansRepository from "@/backend/db/repositories/scans";
import * as scanStepsRepository from "@/backend/db/repositories/scan-steps";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { DEFAULT_WEIGHTS } from "@/backend/scoring/growth-score";
import { NotFoundError } from "@/shared/errors";
import { SUB_SCORE_KEYS, type ScoreSet, type SubScoreKey } from "@/shared/types/score";
import type {
  DashboardData,
  RecommendedAction,
  ScanProgress,
  ScoreDetail,
  ScoreHistoryPoint,
} from "@/shared/types/dashboard";
import type { OpportunityDetail } from "@/shared/types/opportunity";
import type { Scan } from "@/shared/types/scan";
import type { TenantContext } from "@/shared/types/tenant";
import { getWorkspace } from "./organization-service";
import { RESCAN_INTERVAL_MS } from "./scan-service";

const TOP_OPPORTUNITIES = 5;
const RECENT_WINDOW = 20;
const RECOMMENDED_TODAY = 3;
const EFFORT_ORDER = { quick: 0, medium: 1, project: 2 } as const;

export async function getDashboard(ctx: TenantContext): Promise<DashboardData> {
  const recent = await scansRepository.listRecent(ctx, RECENT_WINDOW);
  const latest = recent[0];
  if (!latest) return emptyView(ctx);
  return buildView(ctx, latest, previousCompleted(recent, latest.id), recent);
}

/** The polling view for one scan, used while it is still running. */
export async function getScanView(ctx: TenantContext, scanId: string): Promise<DashboardData> {
  const scan = await scansRepository.findById(ctx, scanId);
  if (!scan) throw new NotFoundError(`No scan ${scanId} for organisation ${ctx.organizationId}`);

  const recent = await scansRepository.listRecent(ctx, RECENT_WINDOW);
  return buildView(ctx, scan, previousCompleted(recent, scanId), recent);
}

/** The change is always reported against the last scan that actually finished. */
function previousCompleted(recent: readonly Scan[], scanId: string): Scan | null {
  const index = recent.findIndex((candidate) => candidate.id === scanId);
  if (index < 0) return null;
  return recent.slice(index + 1).find((candidate) => candidate.status === "done") ?? null;
}

async function emptyView(ctx: TenantContext): Promise<DashboardData> {
  const workspace = await getWorkspace(ctx);
  return {
    organizationName: workspace.organizationName,
    locationLabel: workspace.locationLabel,
    scan: null,
    scores: { growth: null, subScores: [] },
    opportunities: [],
    history: [],
    recommendedToday: [],
    nextScanAt: null,
    isComplete: false,
  };
}

async function buildView(
  ctx: TenantContext,
  scan: Scan,
  previous: Scan | null,
  recent: readonly Scan[],
): Promise<DashboardData> {
  const [workspace, steps, stored, details, previousScores, history] = await Promise.all([
    getWorkspace(ctx),
    scanStepsRepository.listForScan(ctx, scan.id),
    scoresRepository.listForScan(ctx, scan.id),
    opportunitiesRepository.listDetailsForScan(ctx, scan.id),
    previous ? scoresRepository.listForScan(ctx, previous.id) : Promise.resolve([]),
    growthHistory(ctx, recent),
  ]);
  const previousByKey = new Map(previousScores.map((score) => [score.key, score.value]));
  const previousGrowth = previousByKey.get("growth") ?? null;
  const opportunities = details.slice(0, TOP_OPPORTUNITIES);

  const doneCount = steps.filter((step) => step.status === "done").length;
  const progress: ScanProgress = {
    scanId: scan.id,
    status: scan.status,
    steps: steps.map((step) => ({ step: step.step, status: step.status, retryCount: step.retryCount })),
    percentComplete: steps.length === 0 ? 100 : Math.round((doneCount / steps.length) * 100),
  };

  const growthRow = stored.find((score) => score.key === "growth") ?? null;
  const scores: ScoreSet = {
    growth: growthRow
      ? {
          value: growthRow.value,
          deltaVsPrevious: previousGrowth === null ? null : growthRow.value - previousGrowth,
          version: growthRow.version,
        }
      : null,
    subScores: stored
      .filter((score): score is typeof score & { key: SubScoreKey } =>
        (SUB_SCORE_KEYS as readonly string[]).includes(score.key),
      )
      .map((score) => ({
        key: score.key,
        value: score.value,
        version: score.version,
        previousValue: previousByKey.get(score.key) ?? null,
      })),
  };

  return {
    organizationName: workspace.organizationName,
    locationLabel: workspace.locationLabel,
    scan: progress,
    scores,
    opportunities,
    history,
    recommendedToday: pickRecommendedToday(opportunities),
    nextScanAt:
      scan.status === "done"
        ? new Date(new Date(scan.finishedAt ?? scan.startedAt).getTime() + RESCAN_INTERVAL_MS).toISOString()
        : null,
    isComplete: scan.status === "done" || scan.status === "failed",
  };
}

/** Growth Score of each completed scan, oldest first. */
async function growthHistory(ctx: TenantContext, recent: readonly Scan[]): Promise<ScoreHistoryPoint[]> {
  const completed = recent.filter((scan) => scan.status === "done");
  const points = await Promise.all(
    completed.map(async (scan) => {
      const growth = await scoresRepository.findGrowthForScan(ctx, scan.id);
      return growth ? { scanId: scan.id, at: scan.finishedAt ?? scan.startedAt, growth: growth.value } : null;
    }),
  );
  return points.filter((point): point is ScoreHistoryPoint => point !== null).reverse();
}

/**
 * One open action from each of the top opportunities, quickest first, so today's list is spread across the
 * biggest wins rather than three steps of the same one.
 */
function pickRecommendedToday(opportunities: readonly OpportunityDetail[]): RecommendedAction[] {
  const picks: RecommendedAction[] = [];
  for (const opportunity of opportunities) {
    const next = opportunity.actions
      .filter((action) => !action.done)
      .sort((a, b) => EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort])[0];
    if (!next) continue;
    picks.push({
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      actionId: next.id,
      label: next.label,
      effort: next.effort,
    });
    if (picks.length === RECOMMENDED_TODAY) break;
  }
  return picks;
}

/** The deeper view: every sub-score with its movement, plus the scans behind them. */
export async function getScoreDetail(ctx: TenantContext): Promise<ScoreDetail> {
  const recent = await scansRepository.listRecent(ctx, RECENT_WINDOW);
  const completed = recent.filter((scan) => scan.status === "done");
  const latest = completed[0] ?? null;
  const previous = completed[1] ?? null;

  const history = await Promise.all(
    recent.map(async (scan) => ({
      scanId: scan.id,
      status: scan.status,
      startedAt: scan.startedAt,
      finishedAt: scan.finishedAt,
      growth: (await scoresRepository.findGrowthForScan(ctx, scan.id))?.value ?? null,
    })),
  );

  if (!latest) return { growth: null, subScores: [], history };

  const [current, before] = await Promise.all([
    scoresRepository.listForScan(ctx, latest.id),
    previous ? scoresRepository.listForScan(ctx, previous.id) : Promise.resolve([]),
  ]);

  const previousByKey = new Map(before.map((score) => [score.key, score.value]));
  const growthRow = current.find((score) => score.key === "growth") ?? null;

  return {
    growth: growthRow
      ? {
          value: growthRow.value,
          deltaVsPrevious: previousByKey.has("growth") ? growthRow.value - previousByKey.get("growth")! : null,
          version: growthRow.version,
        }
      : null,
    subScores: current
      .filter((score): score is typeof score & { key: SubScoreKey } =>
        (SUB_SCORE_KEYS as readonly string[]).includes(score.key),
      )
      .sort((a, b) => SUB_SCORE_KEYS.indexOf(a.key) - SUB_SCORE_KEYS.indexOf(b.key))
      .map((score) => {
        const previousValue = previousByKey.get(score.key) ?? null;
        return {
          key: score.key,
          value: score.value,
          previousValue,
          delta: previousValue === null ? null : score.value - previousValue,
          weight: DEFAULT_WEIGHTS[score.key],
          version: score.version,
        };
      }),
    history,
  };
}
