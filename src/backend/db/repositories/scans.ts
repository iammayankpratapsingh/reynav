import "server-only";
// Scans repository.
import { getSql, isUuid } from "@/backend/db/client";
import { activeLocationId } from "./locations";
import type { Scan, ScanStatus } from "@/shared/types/scan";
import type { TenantContext } from "@/shared/types/tenant";

type ScanRow = {
  id: string;
  organization_id: string;
  location_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
};

function toScan(row: ScanRow): Scan {
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
  const [row] = await getSql()<ScanRow[]>`
    insert into scans (organization_id, location_id, status, started_at)
    values (${ctx.organizationId}, ${locationId}, 'queued', ${startedAt})
    returning id, organization_id, location_id, status, started_at, finished_at
  `;
  return toScan(row!);
}

export async function setStatus(
  ctx: TenantContext,
  scanId: string,
  status: ScanStatus,
  finishedAt: string | null,
): Promise<void> {
  if (!isUuid(scanId)) return;
  await getSql()`
    update scans set status = ${status}, finished_at = ${finishedAt}, updated_at = now()
    where id = ${scanId} and organization_id = ${ctx.organizationId}
  `;
}

/** Newest first, for the active location. */
export async function listRecent(ctx: TenantContext, limit: number): Promise<Scan[]> {
  const locationId = await activeLocationId(ctx);
  if (!locationId) return [];
  const rows = await getSql()<ScanRow[]>`
    select id, organization_id, location_id, status, started_at, finished_at
    from scans where organization_id = ${ctx.organizationId} and location_id = ${locationId}
    order by started_at desc, id desc
    limit ${limit}
  `;
  return rows.map(toScan);
}

export async function findById(ctx: TenantContext, scanId: string): Promise<Scan | null> {
  if (!isUuid(scanId)) return null;
  const [row] = await getSql()<ScanRow[]>`
    select id, organization_id, location_id, status, started_at, finished_at
    from scans where id = ${scanId} and organization_id = ${ctx.organizationId}
  `;
  return row ? toScan(row) : null;
}

export async function findLatest(ctx: TenantContext): Promise<Scan | null> {
  const [latest] = await listRecent(ctx, 1);
  return latest ?? null;
}
