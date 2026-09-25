import "server-only";
// External connections repository. Tokens are stored encrypted and never leave this file.
import { db } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";
import type { Connection, ConnectionProvider, ConnectionStatus } from "@/shared/types/connection";
import type { TenantContext } from "@/shared/types/tenant";

function toConnection(row: {
  provider: string;
  status: string;
  account_label: string | null;
  connected_at: string | null;
  last_error_code: string | null;
}): Connection {
  return {
    provider: row.provider as ConnectionProvider,
    status: row.status as ConnectionStatus,
    accountLabel: row.account_label,
    connectedAt: row.connected_at,
    lastErrorCode: row.last_error_code,
  };
}

export async function listForLocation(ctx: TenantContext, locationId: string): Promise<Connection[]> {
  seedDemoTenant();
  return db.externalConnections
    .filter((row) => row.organization_id === ctx.organizationId && row.location_id === locationId)
    .map(toConnection);
}

export type UpsertConnectionInput = {
  locationId: string;
  provider: ConnectionProvider;
  status: ConnectionStatus;
  accountLabel: string | null;
  connectedAt: string | null;
  lastErrorCode: string | null;
  /** Already encrypted by the caller in the service layer. */
  encryptedTokens: string | null;
};

export async function upsert(ctx: TenantContext, input: UpsertConnectionInput): Promise<Connection> {
  seedDemoTenant();
  const id = `conn_${ctx.organizationId}_${input.locationId}_${input.provider}`;
  const row = db.externalConnections.upsert({
    id,
    organization_id: ctx.organizationId,
    location_id: input.locationId,
    provider: input.provider,
    status: input.status,
    account_label: input.accountLabel,
    connected_at: input.connectedAt,
    last_error_code: input.lastErrorCode,
    encrypted_tokens: input.encryptedTokens,
    updated_at: new Date().toISOString(),
  });
  return toConnection(row);
}

export async function remove(ctx: TenantContext, locationId: string, provider: ConnectionProvider): Promise<void> {
  seedDemoTenant();
  const id = `conn_${ctx.organizationId}_${locationId}_${provider}`;
  const row = db.externalConnections.findById(id);
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.externalConnections.update(id, {
    status: "disconnected",
    account_label: null,
    connected_at: null,
    last_error_code: null,
    encrypted_tokens: null,
  });
}
