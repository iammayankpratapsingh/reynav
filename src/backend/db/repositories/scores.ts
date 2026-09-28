import "server-only";
// Tenant-scoped repository for stored, versioned scores. Dashboards read these; they never recompute.
import { getSql, isUuid } from "@/backend/db/client";
import type { TenantContext } from "@/shared/types/tenant";
import type { SubScoreKey } from "@/shared/types/score";

export type StoredScore = { key: string; value: number; version: string };

type ScoreRow = { key: string; value: number; formula_version: string };

/** Writing the same key twice for one scan replaces it, so a retried step is safe. */
export async function put(
  ctx: TenantContext,
  scanId: string,
  score: { key: SubScoreKey | "growth"; value: number; version: string },
): Promise<void> {
  await getSql()`
    insert into scores (organization_id, scan_id, key, value, formula_version)
    values (${ctx.organizationId}, ${scanId}, ${score.key}, ${score.value}, ${score.version})
    on conflict (scan_id, key) do update set value = excluded.value, formula_version = excluded.formula_version
  `;
}

export async function listForScan(ctx: TenantContext, scanId: string): Promise<StoredScore[]> {
  if (!isUuid(scanId)) return [];
  const rows = await getSql()<ScoreRow[]>`
    select key, value, formula_version from scores
    where scan_id = ${scanId} and organization_id = ${ctx.organizationId}
    order by created_at, key
  `;
  return rows.map((row) => ({ key: row.key, value: row.value, version: row.formula_version }));
}

export async function findGrowthForScan(ctx: TenantContext, scanId: string): Promise<StoredScore | null> {
  if (!isUuid(scanId)) return null;
  const [row] = await getSql()<ScoreRow[]>`
    select key, value, formula_version from scores
    where scan_id = ${scanId} and key = 'growth' and organization_id = ${ctx.organizationId}
  `;
  return row ? { key: row.key, value: row.value, version: row.formula_version } : null;
}
