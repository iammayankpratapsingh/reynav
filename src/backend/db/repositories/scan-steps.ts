import "server-only";
// Tenant-scoped repository for scan step progress. The UI reads these to show what has finished.
import { db } from "@/backend/db/client";
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

function id(scanId: string, step: ScanStepId): string {
  return `step_${scanId}_${step}`;
}

/** Idempotent: creating the steps for a scan twice leaves the same rows. */
export async function createForScan(ctx: TenantContext, scanId: string): Promise<void> {
  for (const step of SCAN_STEPS) {
    if (db.scanSteps.findById(id(scanId, step))) continue;
    db.scanSteps.insert({
      id: id(scanId, step),
      organization_id: ctx.organizationId,
      scan_id: scanId,
      step,
      status: "waiting",
      started_at: null,
      finished_at: null,
      error_code: null,
      retry_count: 0,
    });
  }
}

export async function markRunning(ctx: TenantContext, scanId: string, step: ScanStepId): Promise<void> {
  const row = db.scanSteps.findById(id(scanId, step));
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.scanSteps.update(row.id, { status: "running", started_at: new Date().toISOString() });
}

export async function markDone(ctx: TenantContext, scanId: string, step: ScanStepId): Promise<void> {
  const row = db.scanSteps.findById(id(scanId, step));
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.scanSteps.update(row.id, { status: "done", finished_at: new Date().toISOString(), error_code: null });
}

/** A failed attempt that will be tried again: the step stays running and the retry is counted. */
export async function markRetrying(
  ctx: TenantContext,
  scanId: string,
  step: ScanStepId,
  errorCode: string,
): Promise<void> {
  const row = db.scanSteps.findById(id(scanId, step));
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.scanSteps.update(row.id, { status: "running", error_code: errorCode, retry_count: row.retry_count + 1 });
}

export async function markFailed(
  ctx: TenantContext,
  scanId: string,
  step: ScanStepId,
  errorCode: string,
): Promise<void> {
  const row = db.scanSteps.findById(id(scanId, step));
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.scanSteps.update(row.id, {
    status: "failed",
    finished_at: new Date().toISOString(),
    error_code: errorCode,
  });
}

export async function listForScan(ctx: TenantContext, scanId: string): Promise<ScanStepRecord[]> {
  const order = new Map(SCAN_STEPS.map((step, index) => [step as string, index]));
  return db.scanSteps
    .filter((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId)
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
