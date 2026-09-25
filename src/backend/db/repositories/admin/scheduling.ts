import "server-only";
// Admin repository (explicitly cross-org): which organisations the scheduled jobs should look at.
// Only the job layer reaches this, through scheduling-service; no request path ever does.
import { db } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";

export type ScheduledTenant = { organizationId: string; ownerUserId: string | null };

/** Every organisation that has finished onboarding, with an owner to attribute scheduled work to. */
export async function listOnboardedOrganizations(): Promise<ScheduledTenant[]> {
  seedDemoTenant();
  const organizationIds = new Set(
    db.businesses
      .filter((business) => (business.onboarded_at ?? null) !== null)
      .map((business) => business.organization_id),
  );
  return [...organizationIds].map((organizationId) => ({
    organizationId,
    ownerUserId: db.users.find((user) => user.organization_id === organizationId && user.role === "owner")?.id ?? null,
  }));
}
