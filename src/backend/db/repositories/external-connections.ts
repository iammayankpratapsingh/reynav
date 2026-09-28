import "server-only";
// External connections repository. Tokens are stored encrypted and never leave this file.
import { getSql, isUuid } from "@/backend/db/client";
import type { Connection, ConnectionProvider, ConnectionStatus } from "@/shared/types/connection";
import type { TenantContext } from "@/shared/types/tenant";

type ConnectionRow = {
  provider: string;
  status: string;
  account_label: string | null;
  connected_at: string | null;
  last_error_code: string | null;
};

function toConnection(row: ConnectionRow): Connection {
  return {
    provider: row.provider as ConnectionProvider,
    status: row.status as ConnectionStatus,
    accountLabel: row.account_label,
    connectedAt: row.connected_at,
    lastErrorCode: row.last_error_code,
  };
}

export async function listForLocation(ctx: TenantContext, locationId: string): Promise<Connection[]> {
  if (!isUuid(locationId)) return [];
  return (
    await getSql()<ConnectionRow[]>`
      select provider, status, account_label, connected_at, last_error_code
      from external_connections
      where organization_id = ${ctx.organizationId} and location_id = ${locationId}
      order by created_at, provider
    `
  ).map(toConnection);
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
  const [row] = await getSql()<ConnectionRow[]>`
    insert into external_connections
      (organization_id, location_id, provider, status, account_label, connected_at, last_error_code, encrypted_tokens)
    values (
      ${ctx.organizationId}, ${input.locationId}, ${input.provider}, ${input.status}, ${input.accountLabel},
      ${input.connectedAt}, ${input.lastErrorCode}, ${input.encryptedTokens}
    )
    on conflict (organization_id, location_id, provider) do update set
      status = excluded.status,
      account_label = excluded.account_label,
      connected_at = excluded.connected_at,
      last_error_code = excluded.last_error_code,
      encrypted_tokens = excluded.encrypted_tokens,
      updated_at = now()
    returning provider, status, account_label, connected_at, last_error_code
  `;
  return toConnection(row!);
}

export async function remove(ctx: TenantContext, locationId: string, provider: ConnectionProvider): Promise<void> {
  if (!isUuid(locationId)) return;
  await getSql()`
    update external_connections set
      status = 'disconnected',
      account_label = null,
      connected_at = null,
      last_error_code = null,
      encrypted_tokens = null,
      updated_at = now()
    where organization_id = ${ctx.organizationId} and location_id = ${locationId} and provider = ${provider}
  `;
}
