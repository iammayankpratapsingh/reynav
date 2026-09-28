import "server-only";
// Admin repository (explicitly cross-org): which organisations the scheduled jobs should look at.
// Only the job layer reaches this, through scheduling-service; no request path ever does.
import { getSql } from "@/backend/db/client";

export type ScheduledTenant = { organizationId: string; ownerUserId: string | null };

/** Every organisation that has finished onboarding, with an owner to attribute scheduled work to. */
export async function listOnboardedOrganizations(): Promise<ScheduledTenant[]> {
  const rows = await getSql()<{ organization_id: string; owner_user_id: string | null }[]>`
    select b.organization_id,
      (select u.id from users u
        where u.organization_id = b.organization_id and u.role = 'owner'
        order by u.created_at limit 1) as owner_user_id
    from businesses b
    where b.onboarded_at is not null
    group by b.organization_id
  `;
  return rows.map((row) => ({ organizationId: row.organization_id, ownerUserId: row.owner_user_id }));
}
