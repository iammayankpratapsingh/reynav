import "server-only";
// Step: write this month's 30-day growth plan from the service scores the previous step stored.
import { buildIfMissing } from "@/backend/services/growth-plan-service";
import type { ScanContext } from "./scan-context";

export async function buildGrowthPlan(scan: ScanContext): Promise<void> {
  await buildIfMissing(scan.tenant, { scanId: scan.scanId, now: new Date() });
}
