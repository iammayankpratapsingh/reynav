import "server-only";
// Users repository. Our users table is the source of truth for identity, role and organisation membership.
import { db } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";
import type { Role } from "@/shared/constants/roles";
import type { TenantContext } from "@/shared/types/tenant";
import type { User } from "@/shared/types/user";

function toUser(row: {
  id: string;
  organization_id: string;
  auth_provider_id: string;
  email: string;
  display_name: string;
  role: string;
}): User {
  return {
    id: row.id,
    organizationId: row.organization_id,
    authProviderId: row.auth_provider_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role as Role,
  };
}

/**
 * Sign-in is the one lookup that cannot be scoped to an organisation, because the organisation is what it
 * resolves. It matches on the auth provider's id only and is never used after a session exists.
 */
export async function findByAuthProviderIdAcrossOrganizations(authProviderId: string): Promise<User | null> {
  seedDemoTenant();
  const row = db.users.find((user) => user.auth_provider_id === authProviderId);
  return row ? toUser(row) : null;
}

export async function findById(ctx: TenantContext, userId: string): Promise<User | null> {
  seedDemoTenant();
  const row = db.users.findById(userId);
  if (!row || row.organization_id !== ctx.organizationId) return null;
  return toUser(row);
}

export async function listForOrganization(ctx: TenantContext): Promise<User[]> {
  seedDemoTenant();
  return db.users.filter((user) => user.organization_id === ctx.organizationId).map(toUser);
}

export async function create(
  ctx: TenantContext,
  input: { authProviderId: string; email: string; displayName: string; role: Role },
): Promise<User> {
  seedDemoTenant();
  const row = db.users.insert({
    id: `usr_${Date.now().toString(36)}`,
    organization_id: ctx.organizationId,
    auth_provider_id: input.authProviderId,
    email: input.email,
    display_name: input.displayName,
    role: input.role,
    created_at: new Date().toISOString(),
  });
  return toUser(row);
}

export async function updateDisplayName(ctx: TenantContext, userId: string, displayName: string): Promise<void> {
  seedDemoTenant();
  const row = db.users.findById(userId);
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.users.update(userId, { display_name: displayName });
}
