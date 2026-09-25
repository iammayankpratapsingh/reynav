import "server-only";
// Scheduled work across tenants: which organisations are due a weekly re-scan, and starting it.
import * as schedulingRepository from "@/backend/db/repositories/admin/scheduling";
import * as locationsRepository from "@/backend/db/repositories/locations";
import { logger } from "@/backend/lib/logger";
import type { TenantContext } from "@/shared/types/tenant";
import * as scanService from "./scan-service";

export async function runWeeklyRescans(now: Date): Promise<void> {
  const tenants = await schedulingRepository.listOnboardedOrganizations();
  let started = 0;
  for (const tenant of tenants) {
    const orgCtx: TenantContext = { organizationId: tenant.organizationId, userId: tenant.ownerUserId, role: "system" };
    try {
      for (const location of await locationsRepository.listAll(orgCtx)) {
        if (await scanService.startIfDue({ ...orgCtx, locationId: location.id }, now)) started += 1;
      }
    } catch (error) {
      // One tenant failing must not stop the rest of the night's scans.
      logger.error({
        message: "weekly re-scan failed to start",
        organizationId: tenant.organizationId,
        detail: String(error),
      });
    }
  }
  logger.info({ message: "weekly re-scan pass", checked: tenants.length, started });
}
