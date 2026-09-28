import "server-only";
// Team invitations: who has been asked to join the organisation, with which role.
import { getSql, isUuid } from "@/backend/db/client";
import type { Role } from "@/shared/constants/roles";
import type { Invitation } from "@/shared/types/settings";
import type { TenantContext } from "@/shared/types/tenant";

export async function listPending(ctx: TenantContext): Promise<Invitation[]> {
  const rows = await getSql()<{ id: string; email: string; role: string; created_at: string }[]>`
    select id, email, role, created_at from invitations
    where organization_id = ${ctx.organizationId} and status = 'pending'
    order by created_at desc
  `;
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role as Role,
    status: "pending",
    createdAt: row.created_at,
  }));
}

export async function create(ctx: TenantContext, input: { email: string; role: Role }): Promise<void> {
  await getSql()`
    insert into invitations (organization_id, email, role, invited_by, status)
    values (${ctx.organizationId}, ${input.email}, ${input.role}, ${isUuid(ctx.userId) ? ctx.userId : null}, 'pending')
  `;
}

export async function revoke(ctx: TenantContext, invitationId: string): Promise<boolean> {
  if (!isUuid(invitationId)) return false;
  const updated = await getSql()`
    update invitations set status = 'revoked', updated_at = now()
    where id = ${invitationId} and organization_id = ${ctx.organizationId}
  `;
  return updated.count > 0;
}
