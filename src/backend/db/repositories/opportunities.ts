import "server-only";
// Tenant-scoped repository for the ranked opportunities a scan produced.
// The detail a single opportunity screen needs is computed during the scan and stored here as JSON,
// so reading one is a lookup, never a recomputation.
import type postgres from "postgres";
import { z } from "zod";
import { getSql, isUuid } from "@/backend/db/client";
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

type Row = {
  id: string;
  rank: number;
  title: string;
  note: string;
  impact: string;
  score: number;
  estimated_bookings_low: number | null;
  estimated_bookings_high: number | null;
  estimated_revenue_low: number | null;
  estimated_revenue_high: number | null;
  keyword: string | null;
  service_slug: string | null;
  monthly_searches: number | null;
  your_position: number | null;
  top_competitor_position: number | null;
  /** Detail payloads the scan produced, parsed on read. */
  detail: unknown;
  formula_version: string;
};

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
function parseDetail(detail: unknown): DetailPayload {
  const parsed = DetailSchema.safeParse(detail ?? {});
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
    ...parseDetail(row.detail),
  };
}

/** Replaces the whole ranked list for a scan, so re-running the step cannot duplicate rows. */
export async function replaceForScan(
  ctx: TenantContext,
  scanId: string,
  opportunities: readonly SaveOpportunityInput[],
): Promise<void> {
  const sql = getSql();
  const rows = opportunities.map((opportunity) => ({
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
    detail: sql.json({
      difficulty: opportunity.difficulty,
      locationLabel: opportunity.locationLabel,
      actions: opportunity.actions,
      competitors: opportunity.competitors,
      contentPlan: opportunity.contentPlan,
    } as unknown as postgres.JSONValue),
    formula_version: opportunity.version,
  }));
  await sql.begin(async (tx) => {
    await tx`delete from opportunities where scan_id = ${scanId} and organization_id = ${ctx.organizationId}`;
    if (rows.length > 0) await tx`insert into opportunities ${tx(rows)}`;
  });
}

const COLUMNS = "id, rank, title, note, impact, score, estimated_bookings_low, estimated_bookings_high, estimated_revenue_low, estimated_revenue_high, keyword, service_slug, monthly_searches, your_position, top_competitor_position, detail, formula_version";

export async function listForScan(ctx: TenantContext, scanId: string, limit: number): Promise<Opportunity[]> {
  if (!isUuid(scanId)) return [];
  const sql = getSql();
  const rows = await sql<Row[]>`
    select ${sql.unsafe(COLUMNS)} from opportunities
    where scan_id = ${scanId} and organization_id = ${ctx.organizationId}
    order by rank
    limit ${limit}
  `;
  return rows.map(toSummary);
}

export async function listDetailsForScan(ctx: TenantContext, scanId: string): Promise<OpportunityDetail[]> {
  if (!isUuid(scanId)) return [];
  const sql = getSql();
  const rows = await sql<Row[]>`
    select ${sql.unsafe(COLUMNS)} from opportunities
    where scan_id = ${scanId} and organization_id = ${ctx.organizationId}
    order by rank
  `;
  return rows.map(toDetail);
}

export async function findById(ctx: TenantContext, opportunityId: string): Promise<OpportunityDetail | null> {
  if (!isUuid(opportunityId)) return null;
  const sql = getSql();
  const [row] = await sql<Row[]>`
    select ${sql.unsafe(COLUMNS)} from opportunities
    where id = ${opportunityId} and organization_id = ${ctx.organizationId}
  `;
  return row ? toDetail(row) : null;
}

/** Ticking an action off is the one thing the screen writes back. */
export async function setActionDone(
  ctx: TenantContext,
  opportunityId: string,
  actionId: string,
  done: boolean,
): Promise<OpportunityDetail | null> {
  if (!isUuid(opportunityId)) return null;
  const sql = getSql();
  // Read and write in one transaction, locking the row, so two quick ticks cannot overwrite each other.
  const updated = await sql.begin(async (tx) => {
    const [row] = await tx<{ detail: unknown }[]>`
      select detail from opportunities
      where id = ${opportunityId} and organization_id = ${ctx.organizationId}
      for update
    `;
    if (!row) return false;
    const detail = parseDetail(row.detail);
    const actions = detail.actions.map((action) => (action.id === actionId ? { ...action, done } : action));
    await tx`
      update opportunities set detail = ${tx.json({ ...detail, actions } as unknown as postgres.JSONValue)}
      where id = ${opportunityId} and organization_id = ${ctx.organizationId}
    `;
    return true;
  });

  return updated ? findById(ctx, opportunityId) : null;
}
