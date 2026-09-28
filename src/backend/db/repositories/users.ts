import "server-only";
// Users repository. Our users table is the source of truth for identity, role and organisation membership.
import { getSql, isUuid } from "@/backend/db/client";
import type { Role } from "@/shared/constants/roles";
import type { TenantContext } from "@/shared/types/tenant";
import type { User } from "@/shared/types/user";

type UserRow = {
  id: string;
  organization_id: string;
  auth_provider_id: string;
  email: string;
  display_name: string;
  role: string;
};

function toUser(row: UserRow): User {
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
  const [row] = await getSql()<UserRow[]>`
    select id, organization_id, auth_provider_id, email, display_name, role
    from users where auth_provider_id = ${authProviderId}
  `;
  return row ? toUser(row) : null;
}

export async function findById(ctx: TenantContext, userId: string): Promise<User | null> {
  if (!isUuid(userId)) return null;
  const [row] = await getSql()<UserRow[]>`
    select id, organization_id, auth_provider_id, email, display_name, role
    from users where id = ${userId} and organization_id = ${ctx.organizationId}
  `;
  return row ? toUser(row) : null;
}

export async function listForOrganization(ctx: TenantContext): Promise<User[]> {
  const rows = await getSql()<UserRow[]>`
    select id, organization_id, auth_provider_id, email, display_name, role
    from users where organization_id = ${ctx.organizationId}
    order by created_at, id
  `;
  return rows.map(toUser);
}

export async function create(
  ctx: TenantContext,
  input: { authProviderId: string; email: string; displayName: string; role: Role },
): Promise<User> {
  const [row] = await getSql()<UserRow[]>`
    insert into users (organization_id, auth_provider_id, email, display_name, role)
    values (${ctx.organizationId}, ${input.authProviderId}, ${input.email}, ${input.displayName}, ${input.role})
    returning id, organization_id, auth_provider_id, email, display_name, role
  `;
  return toUser(row!);
}

export async function updateDisplayName(ctx: TenantContext, userId: string, displayName: string): Promise<void> {
  if (!isUuid(userId)) return;
  await getSql()`
    update users set display_name = ${displayName}, updated_at = now()
    where id = ${userId} and organization_id = ${ctx.organizationId}
  `;
}
