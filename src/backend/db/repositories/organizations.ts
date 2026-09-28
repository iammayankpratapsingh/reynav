import "server-only";
// Organizations repository.
import { getSql } from "@/backend/db/client";
import type { TenantContext } from "@/shared/types/tenant";

export type Organization = { id: string; name: string; createdAt: string };

type OrganizationRow = { id: string; name: string; created_at: string };

function toOrganization(row: OrganizationRow): Organization {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export async function findForContext(ctx: TenantContext): Promise<Organization | null> {
  const [row] = await getSql()<OrganizationRow[]>`
    select id, name, created_at from organizations where id = ${ctx.organizationId}
  `;
  return row ? toOrganization(row) : null;
}

/** Creating an organisation is where a tenant begins, so it takes no context. */
export async function create(input: { name: string }): Promise<Organization> {
  const [row] = await getSql()<OrganizationRow[]>`
    insert into organizations (name) values (${input.name}) returning id, name, created_at
  `;
  return toOrganization(row!);
}

export async function rename(ctx: TenantContext, name: string): Promise<void> {
  await getSql()`update organizations set name = ${name}, updated_at = now() where id = ${ctx.organizationId}`;
}
