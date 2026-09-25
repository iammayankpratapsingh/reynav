import "server-only";
// Tenant-scoped repository for the ranked opportunities a scan produced.
// The detail a single opportunity screen needs is computed during the scan and stored here as JSON,
// so reading one is a lookup, never a recomputation.
import { z } from "zod";
import { db } from "@/backend/db/client";
import type {
  Difficulty,
  ImpactTier,
  Opportunity,
  OpportunityAction,
  OpportunityCompetitor,
  OpportunityContentPiece,
  OpportunityDetail,
} from "@/shared/types/opportunity";
import type { TenantContext } from "@/shared/types/tenant";

const DetailSchema = z.object({
  // Older rows predate these two fields; defaults keep them readable.
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  locationLabel: z.string().default(""),
  actions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      effort: z.enum(["quick", "medium", "project"]),
      done: z.boolean(),
    }),
  ),
  competitors: z.array(
    z.object({
      name: z.string(),
      averageRating: z.number(),
      reviewCount: z.number(),
      averageMapPosition: z.number(),
      outranksYou: z.boolean(),
    }),
  ),
  contentPlan: z.array(
    z.object({
      contentTypeId: z.string(),
      name: z.string(),
      channel: z.string(),
      estimatedMinutes: z.number(),
    }),
  ),
});

type DetailPayload = {
  difficulty: Difficulty;
  locationLabel: string;
  actions: readonly OpportunityAction[];
  competitors: readonly OpportunityCompetitor[];
  contentPlan: readonly OpportunityContentPiece[];
};

export type SaveOpportunityInput = Omit<OpportunityDetail, "id">;

type Row = ReturnType<typeof db.opportunities.filter>[number];

function toSummary(row: Row): Opportunity {
  return {
    id: row.id,
    rank: row.rank,
    title: row.title,
    note: row.note,
    impact: row.impact as ImpactTier,
    score: row.score,
    estimatedMonthlyBookings:
      row.estimated_bookings_low === null || row.estimated_bookings_high === null
        ? null
        : { low: row.estimated_bookings_low, high: row.estimated_bookings_high },
    version: row.formula_version,
  };
}

/** A stored detail that no longer parses is treated as absent rather than crashing the screen. */
function parseDetail(json: string): DetailPayload {
  const parsed = DetailSchema.safeParse(JSON.parse(json || "{}"));
  if (!parsed.success) return { difficulty: "medium", locationLabel: "", actions: [], competitors: [], contentPlan: [] };
  return parsed.data;
}

function toDetail(row: Row): OpportunityDetail {
  return {
    ...toSummary(row),
    keyword: row.keyword,
    serviceSlug: row.service_slug,
    monthlySearches: row.monthly_searches,
    yourPosition: row.your_position,
    topCompetitorPosition: row.top_competitor_position,
    estimatedMonthlyRevenue:
      row.estimated_revenue_low === null || row.estimated_revenue_high === null
        ? null
        : { low: row.estimated_revenue_low, high: row.estimated_revenue_high },
    ...parseDetail(row.detail_json),
  };
}

/** Replaces the whole ranked list for a scan, so re-running the step cannot duplicate rows. */
export async function replaceForScan(
  ctx: TenantContext,
  scanId: string,
  opportunities: readonly SaveOpportunityInput[],
): Promise<void> {
  db.opportunities.remove((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId);
  const createdAt = new Date().toISOString();
  for (const opportunity of opportunities) {
    db.opportunities.insert({
      id: `opp_${scanId}_${opportunity.rank}`,
      organization_id: ctx.organizationId,
      scan_id: scanId,
      rank: opportunity.rank,
      title: opportunity.title,
      note: opportunity.note,
      impact: opportunity.impact,
      score: opportunity.score,
      estimated_bookings_low: opportunity.estimatedMonthlyBookings?.low ?? null,
      estimated_bookings_high: opportunity.estimatedMonthlyBookings?.high ?? null,
      estimated_revenue_low: opportunity.estimatedMonthlyRevenue?.low ?? null,
      estimated_revenue_high: opportunity.estimatedMonthlyRevenue?.high ?? null,
      keyword: opportunity.keyword,
      service_slug: opportunity.serviceSlug,
      monthly_searches: opportunity.monthlySearches,
      your_position: opportunity.yourPosition,
      top_competitor_position: opportunity.topCompetitorPosition,
      detail_json: JSON.stringify({
        difficulty: opportunity.difficulty,
        locationLabel: opportunity.locationLabel,
        actions: opportunity.actions,
        competitors: opportunity.competitors,
        contentPlan: opportunity.contentPlan,
      }),
      formula_version: opportunity.version,
      created_at: createdAt,
    });
  }
}

export async function listForScan(ctx: TenantContext, scanId: string, limit: number): Promise<Opportunity[]> {
  return db.opportunities
    .filter((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(toSummary);
}

export async function listDetailsForScan(ctx: TenantContext, scanId: string): Promise<OpportunityDetail[]> {
  return db.opportunities
    .filter((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId)
    .sort((a, b) => a.rank - b.rank)
    .map(toDetail);
}

export async function findById(ctx: TenantContext, opportunityId: string): Promise<OpportunityDetail | null> {
  const row = db.opportunities.findById(opportunityId);
  if (!row || row.organization_id !== ctx.organizationId) return null;
  return toDetail(row);
}

/** Ticking an action off is the one thing the screen writes back. */
export async function setActionDone(
  ctx: TenantContext,
  opportunityId: string,
  actionId: string,
  done: boolean,
): Promise<OpportunityDetail | null> {
  const row = db.opportunities.findById(opportunityId);
  if (!row || row.organization_id !== ctx.organizationId) return null;

  const detail = parseDetail(row.detail_json);
  const actions = detail.actions.map((action) => (action.id === actionId ? { ...action, done } : action));
  db.opportunities.update(row.id, { detail_json: JSON.stringify({ ...detail, actions }) });

  return findById(ctx, opportunityId);
}
