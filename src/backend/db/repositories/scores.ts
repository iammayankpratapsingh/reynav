import "server-only";
// Tenant-scoped repository for stored, versioned scores. Dashboards read these; they never recompute.
import { db } from "@/backend/db/client";
import type { TenantContext } from "@/shared/types/tenant";
import type { SubScoreKey } from "@/shared/types/score";

export type StoredScore = { key: string; value: number; version: string };

/** Writing the same key twice for one scan replaces it, so a retried step is safe. */
export async function put(
  ctx: TenantContext,
  scanId: string,
  score: { key: SubScoreKey | "growth"; value: number; version: string },
): Promise<void> {
  db.scores.upsert({
    id: `score_${scanId}_${score.key}`,
    organization_id: ctx.organizationId,
    scan_id: scanId,
    key: score.key,
    value: score.value,
    formula_version: score.version,
    created_at: new Date().toISOString(),
  });
}

export async function listForScan(ctx: TenantContext, scanId: string): Promise<StoredScore[]> {
  return db.scores
    .filter((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId)
    .map((row) => ({ key: row.key, value: row.value, version: row.formula_version }));
}

export async function findGrowthForScan(ctx: TenantContext, scanId: string): Promise<StoredScore | null> {
  const row = db.scores.findById(`score_${scanId}_growth`);
  if (!row || row.organization_id !== ctx.organizationId) return null;
  return { key: row.key, value: row.value, version: row.formula_version };
}
