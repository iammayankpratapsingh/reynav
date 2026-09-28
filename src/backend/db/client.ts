import "server-only";
// The database client: one Postgres connection pool per server instance, shared by every repository.
// Nothing above the repository layer imports it.
//
// Values come back in the shapes the domain types already use: timestamps as ISO strings, calendar dates as
// "YYYY-MM-DD", numerics as numbers. Repositories never convert them themselves.
import postgres from "postgres";
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";

export type Sql = postgres.Sql;

function connect(): Sql {
  if (!config.databaseUrl) throw new ConfigError("DATABASE_URL is not set");
  return postgres(config.databaseUrl, {
    // Serverless instances are many and short-lived; each keeps only a few connections open.
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    // Transaction poolers (Supabase on port 6543, PgBouncer) do not support prepared statements.
    prepare: false,
    types: {
      date: {
        to: 1184,
        from: [1114, 1184],
        serialize: (value: Date | string) => (value instanceof Date ? value : new Date(value)).toISOString(),
        parse: (value: string) => new Date(value).toISOString(),
      },
      calendarDate: {
        to: 1082,
        from: [1082],
        serialize: (value: string) => value,
        parse: (value: string) => value,
      },
      numeric: {
        to: 1700,
        from: [1700],
        serialize: (value: number) => String(value),
        parse: (value: string) => Number(value),
      },
    },
  });
}

// Survives hot reloads in development so each reload does not open a new pool.
const globalForSql = globalThis as typeof globalThis & { __reynavSql?: Sql };

/** The shared client, opened on first use. */
export function getSql(): Sql {
  return (globalForSql.__reynavSql ??= connect());
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Every id is a uuid. Ids that arrive from a URL, a form or an old session are checked before they reach a
 * query, so a malformed one reads as "not found" rather than a database error.
 */
export function isUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
