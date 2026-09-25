import "server-only";
// Team invitations: who has been asked to join the organisation, with which role.
import { db } from "@/backend/db/client";
import type { Role } from "@/shared/constants/roles";
import type { Invitation } from "@/shared/types/settings";
import type { TenantContext } from "@/shared/types/tenant";

export async function listPending(ctx: TenantContext): Promise<Invitation[]> {
  return db.invitations
    .filter((row) => row.organization_id === ctx.organizationId && row.status === "pending")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role as Role,
      status: "pending",
      createdAt: row.created_at,
    }));
}

export async function create(ctx: TenantContext, input: { email: string; role: Role }): Promise<void> {
  db.invitations.insert({
    id: `inv_${Date.now().toString(36)}`,
    organization_id: ctx.organizationId,
    email: input.email,
    role: input.role,
    invited_by: ctx.userId,
    status: "pending",
    created_at: new Date().toISOString(),
  });
}

export async function revoke(ctx: TenantContext, invitationId: string): Promise<boolean> {
  const row = db.invitations.findById(invitationId);
  if (!row || row.organization_id !== ctx.organizationId) return false;
  db.invitations.update(invitationId, { status: "revoked" });
  return true;
}
