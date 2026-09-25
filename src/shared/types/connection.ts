// External connection domain types (no token fields — tokens live encrypted in the repository layer only).

/** Capabilities reached through an authorization handshake, named after what they do, not who provides them. */
export const AUTHORIZABLE_PROVIDERS = [
  "local-listing",
  "search-performance",
  "web-analytics",
  "booking-source",
] as const;

export type AuthorizableProvider = (typeof AUTHORIZABLE_PROVIDERS)[number];

/** Every connectable capability. A website is typed in rather than authorized, so it stands apart. */
export const CONNECTION_PROVIDERS = ["website", ...AUTHORIZABLE_PROVIDERS] as const;

export type ConnectionProvider = (typeof CONNECTION_PROVIDERS)[number];

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "needs_reconnect" | "failed";

export type Connection = {
  provider: ConnectionProvider;
  status: ConnectionStatus;
  /** What the connection points at, safe to display: a domain, an account name, a listing name. */
  accountLabel: string | null;
  connectedAt: string | null; // ISO 8601
  lastErrorCode: string | null;
};

export function isConnectionProvider(value: string): value is ConnectionProvider {
  return (CONNECTION_PROVIDERS as readonly string[]).includes(value);
}

export function isAuthorizableProvider(value: string): value is AuthorizableProvider {
  return (AUTHORIZABLE_PROVIDERS as readonly string[]).includes(value);
}
