import "server-only";
// Scans. Starting one records the scan and hands it to the job runner; nothing long-running happens in the request.
import { getJobRunner } from "@/backend/adapters/job-runner";
import type { JobPriority } from "@/backend/adapters/job-runner/types";
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as locationsRepository from "@/backend/db/repositories/locations";
import * as scansRepository from "@/backend/db/repositories/scans";
import * as scanStepsRepository from "@/backend/db/repositories/scan-steps";
import { logger } from "@/backend/lib/logger";
import { SCAN_REQUESTED } from "@/backend/jobs/events";
import { NotFoundError, ValidationError } from "@/shared/errors";
import type { Scan } from "@/shared/types/scan";
import type { TenantContext } from "@/shared/types/tenant";
import { getOnboardingState, requirePrimaryBusiness } from "./onboarding-service";

/** How long after a finished scan the next one is due. */
export const RESCAN_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

/** A scan someone asked for: someone is watching, so it runs at interactive priority. */
export async function start(ctx: TenantContext): Promise<Scan> {
  const scan = await queue(ctx, "interactive");
  // The first scan is where onboarding ends; from here the owner lands on Home.
  const business = await requirePrimaryBusiness(ctx);
  await businessesRepository.markOnboarded(ctx, business.id, scan.startedAt);
  return scan;
}

/**
 * The weekly re-scan: starts one only when the last scan finished more than a week ago and nothing is
 * already queued or running. Returns whether it started one.
 */
export async function startIfDue(ctx: TenantContext, now: Date): Promise<boolean> {
  const latest = await scansRepository.findLatest(ctx);
  if (latest && (latest.status === "queued" || latest.status === "running")) return false;
  const due = nextScheduledAt(latest);
  if (due !== null && due.getTime() > now.getTime()) return false;
  await queue(ctx, "scheduled");
  return true;
}

/** When the weekly re-scan will next run, or null when there has never been a scan to repeat. */
export async function findNextScheduledAt(ctx: TenantContext): Promise<string | null> {
  return nextScheduledAt(await scansRepository.findLatest(ctx))?.toISOString() ?? null;
}

function nextScheduledAt(latest: Scan | null): Date | null {
  if (!latest) return null;
  return new Date(new Date(latest.finishedAt ?? latest.startedAt).getTime() + RESCAN_INTERVAL_MS);
}

async function queue(ctx: TenantContext, priority: JobPriority): Promise<Scan> {
  const state = await getOnboardingState(ctx);
  if (!state.canStartAnalysis) {
    throw new ValidationError(
      "Scan started before the website profile was confirmed",
      "Add your website and confirm your business type first.",
    );
  }

  const location = await locationsRepository.findPrimary(ctx);
  if (!location) throw new NotFoundError(`No location for organisation ${ctx.organizationId}`);

  const scan = await scansRepository.create(ctx, location.id, new Date().toISOString());
  await scanStepsRepository.createForScan(ctx, scan.id);

  await getJobRunner().send({
    name: SCAN_REQUESTED,
    priority,
    data: {
      organizationId: ctx.organizationId,
      userId: ctx.userId ?? "",
      role: ctx.role,
      scanId: scan.id,
      locationId: location.id,
    },
  });

  logger.info({ message: "scan queued", organizationId: ctx.organizationId, scanId: scan.id, priority });
  return scan;
}

export async function findLatest(ctx: TenantContext): Promise<Scan | null> {
  return scansRepository.findLatest(ctx);
}
