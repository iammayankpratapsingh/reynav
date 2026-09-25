import "server-only";
// Resolves the caller's TenantContext from the session. Every authenticated read starts here.
import { UnauthorizedError } from "@/shared/errors";
import type { TenantContext } from "@/shared/types/tenant";
import { readSession } from "./session";

export async function getTenant(): Promise<TenantContext | null> {
  const session = await readSession();
  if (!session) return null;
  return {
    organizationId: session.organizationId,
    userId: session.userId,
    role: session.role,
    locationId: session.locationId ?? null,
  };
}

export async function requireTenant(): Promise<TenantContext> {
  const ctx = await getTenant();
  if (!ctx) throw new UnauthorizedError("No valid session");
  return ctx;
}
