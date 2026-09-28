import "server-only";
// Resolves the caller's TenantContext from the session. Every authenticated read starts here.
import { isUuid } from "@/backend/db/client";
import { UnauthorizedError } from "@/shared/errors";
import type { TenantContext } from "@/shared/types/tenant";
import { readSession } from "./session";

export async function getTenant(): Promise<TenantContext | null> {
  const session = await readSession();
  // A session signed before ids were uuids names rows that no longer exist; it reads as signed out.
  if (!session || !isUuid(session.organizationId) || !isUuid(session.userId)) return null;
  return {
    organizationId: session.organizationId,
    userId: session.userId,
    role: session.role,
    locationId: isUuid(session.locationId) ? session.locationId : null,
  };
}

export async function requireTenant(): Promise<TenantContext> {
  const ctx = await getTenant();
  if (!ctx) throw new UnauthorizedError("No valid session");
  return ctx;
}
