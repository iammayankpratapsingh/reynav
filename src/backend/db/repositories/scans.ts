import "server-only";
// Scans repository.
import { db } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";
import { activeLocationId } from "./locations";
import type { Scan, ScanStatus } from "@/shared/types/scan";
import type { TenantContext } from "@/shared/types/tenant";

function toScan(row: {
  id: string;
  organization_id: string;
  location_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
}): Scan {
  return {
    id: row.id,
    organizationId: row.organization_id,
    locationId: row.location_id,
    status: row.status as ScanStatus,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  };
}

export async function create(ctx: TenantContext, locationId: string, startedAt: string): Promise<Scan> {
  seedDemoTenant();
  const row = db.scans.insert({
    id: `scan_${Date.now().toString(36)}`,
    organization_id: ctx.organizationId,
    location_id: locationId,
    status: "queued",
    started_at: startedAt,
    finished_at: null,
  });
  return toScan(row);
}

export async function setStatus(
  ctx: TenantContext,
  scanId: string,
  status: ScanStatus,
  finishedAt: string | null,
): Promise<void> {
  const row = db.scans.findById(scanId);
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.scans.update(scanId, { status, finished_at: finishedAt });
}

/** Newest first, for the active location. */
export async function listRecent(ctx: TenantContext, limit: number): Promise<Scan[]> {
  const locationId = await activeLocationId(ctx);
  return db.scans
    .filter((row) => row.organization_id === ctx.organizationId && row.location_id === locationId)
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
    .slice(0, limit)
    .map(toScan);
}

export async function findById(ctx: TenantContext, scanId: string): Promise<Scan | null> {
  const row = db.scans.findById(scanId);
  if (!row || row.organization_id !== ctx.organizationId) return null;
  return toScan(row);
}

export async function findLatest(ctx: TenantContext): Promise<Scan | null> {
  seedDemoTenant();
  const [latest] = await listRecent(ctx, 1);
  return latest ?? null;
}
