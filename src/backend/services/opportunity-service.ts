import "server-only";
// Opportunities: the ranked list from the latest scan, and the detail behind one of them.
import * as opportunitiesRepository from "@/backend/db/repositories/opportunities";
import * as scansRepository from "@/backend/db/repositories/scans";
import { NotFoundError } from "@/shared/errors";
import type { OpportunityBoard, OpportunityDetail } from "@/shared/types/opportunity";
import type { TenantContext } from "@/shared/types/tenant";

async function latestCompletedScanId(ctx: TenantContext): Promise<{ id: string; at: string } | null> {
  const recent = await scansRepository.listRecent(ctx, 20);
  const done = recent.find((scan) => scan.status === "done");
  return done ? { id: done.id, at: done.finishedAt ?? done.startedAt } : null;
}

export async function getBoard(ctx: TenantContext): Promise<OpportunityBoard> {
  const latest = await latestCompletedScanId(ctx);
  if (!latest) return { scanId: null, scannedAt: null, opportunities: [] };
  return {
    scanId: latest.id,
    scannedAt: latest.at,
    opportunities: await opportunitiesRepository.listDetailsForScan(ctx, latest.id),
  };
}

export async function getDetail(ctx: TenantContext, opportunityId: string): Promise<OpportunityDetail> {
  const opportunity = await opportunitiesRepository.findById(ctx, opportunityId);
  if (!opportunity) throw new NotFoundError(`No opportunity ${opportunityId} for ${ctx.organizationId}`);
  return opportunity;
}

export async function setActionDone(
  ctx: TenantContext,
  opportunityId: string,
  actionId: string,
  done: boolean,
): Promise<OpportunityDetail> {
  const updated = await opportunitiesRepository.setActionDone(ctx, opportunityId, actionId, done);
  if (!updated) throw new NotFoundError(`No opportunity ${opportunityId} for ${ctx.organizationId}`);
  return updated;
}
