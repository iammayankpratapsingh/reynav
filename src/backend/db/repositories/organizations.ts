import "server-only";
// Organizations repository.
import { db } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";
import type { TenantContext } from "@/shared/types/tenant";

export type Organization = { id: string; name: string; createdAt: string };

export async function findForContext(ctx: TenantContext): Promise<Organization | null> {
  seedDemoTenant();
  const row = db.organizations.findById(ctx.organizationId);
  return row ? { id: row.id, name: row.name, createdAt: row.created_at } : null;
}

/** Creating an organisation is where a tenant begins, so it takes no context. */
export async function create(input: { name: string }): Promise<Organization> {
  seedDemoTenant();
  const row = db.organizations.insert({
    id: `org_${Date.now().toString(36)}`,
    name: input.name,
    created_at: new Date().toISOString(),
  });
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export async function rename(ctx: TenantContext, name: string): Promise<void> {
  seedDemoTenant();
  if (!db.organizations.findById(ctx.organizationId)) return;
  db.organizations.update(ctx.organizationId, { name });
}
