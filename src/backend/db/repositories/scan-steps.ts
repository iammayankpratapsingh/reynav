import "server-only";
// Tenant-scoped repository for scan step progress. The UI reads these to show what has finished.
import { getSql, isUuid } from "@/backend/db/client";
import type { ScanStepId, ScanStepStatus } from "@/shared/constants/scan-steps";
import { SCAN_STEPS } from "@/shared/constants/scan-steps";
import type { TenantContext } from "@/shared/types/tenant";

export type ScanStepRecord = {
  step: ScanStepId;
  status: ScanStepStatus;
  startedAt: string | null;
  finishedAt: string | null;
  errorCode: string | null;
  /** How many times the step has been retried after a failure. */
  retryCount: number;
};

type ScanStepRow = {
  step: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  error_code: string | null;
  retry_count: number;
};

/** Idempotent: creating the steps for a scan twice leaves the same rows. */
export async function createForScan(ctx: TenantContext, scanId: string): Promise<void> {
  const sql = getSql();
  const rows = SCAN_STEPS.map((step) => ({ organization_id: ctx.organizationId, scan_id: scanId, step, status: "waiting" }));
  await sql`
    insert into scan_steps ${sql(rows, "organization_id", "scan_id", "step", "status")}
    on conflict (scan_id, step) do nothing
  `;
}

export async function markRunning(ctx: TenantContext, scanId: string, step: ScanStepId): Promise<void> {
  if (!isUuid(scanId)) return;
  await getSql()`
    update scan_steps set status = 'running', started_at = now(), updated_at = now()
    where scan_id = ${scanId} and step = ${step} and organization_id = ${ctx.organizationId}
  `;
}

export async function markDone(ctx: TenantContext, scanId: string, step: ScanStepId): Promise<void> {
  if (!isUuid(scanId)) return;
  await getSql()`
    update scan_steps set status = 'done', finished_at = now(), error_code = null, updated_at = now()
    where scan_id = ${scanId} and step = ${step} and organization_id = ${ctx.organizationId}
  `;
}

/** A failed attempt that will be tried again: the step stays running and the retry is counted. */
export async function markRetrying(
  ctx: TenantContext,
  scanId: string,
  step: ScanStepId,
  errorCode: string,
): Promise<void> {
  if (!isUuid(scanId)) return;
  await getSql()`
    update scan_steps set status = 'running', error_code = ${errorCode}, retry_count = retry_count + 1, updated_at = now()
    where scan_id = ${scanId} and step = ${step} and organization_id = ${ctx.organizationId}
  `;
}

export async function markFailed(
  ctx: TenantContext,
  scanId: string,
  step: ScanStepId,
  errorCode: string,
): Promise<void> {
  if (!isUuid(scanId)) return;
  await getSql()`
    update scan_steps set status = 'failed', finished_at = now(), error_code = ${errorCode}, updated_at = now()
    where scan_id = ${scanId} and step = ${step} and organization_id = ${ctx.organizationId}
  `;
}

export async function listForScan(ctx: TenantContext, scanId: string): Promise<ScanStepRecord[]> {
  if (!isUuid(scanId)) return [];
  const rows = await getSql()<ScanStepRow[]>`
    select step, status, started_at, finished_at, error_code, retry_count
    from scan_steps where scan_id = ${scanId} and organization_id = ${ctx.organizationId}
  `;
  const order = new Map(SCAN_STEPS.map((step, index) => [step as string, index]));
  return rows
    .sort((a, b) => (order.get(a.step) ?? 0) - (order.get(b.step) ?? 0))
    .map((row) => ({
      step: row.step as ScanStepId,
      status: row.status as ScanStepStatus,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      errorCode: row.error_code,
      retryCount: row.retry_count,
    }));
}
