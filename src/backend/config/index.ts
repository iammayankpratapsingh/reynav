import "server-only";
// The only place env vars and secrets are read; validated with zod at startup.
import { z } from "zod";
import { ConfigError } from "@/shared/errors";

function booleanish(fallback: "true" | "false") {
  return z
    .enum(["true", "false", "1", "0"])
    .default(fallback)
    .transform((value) => value === "true" || value === "1");
}

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  /** When true every adapter resolves to its mock. Nothing leaves the process. */
  useMockData: booleanish("true"),
  session: z.object({
    /** HMAC key for the session cookie. Required outside development. */
    secret: z.string().min(32),
    cookieName: z.string().default("reynav_session"),
    maxAgeSeconds: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  }),
  /** 32-byte key, hex or base64, for encrypting OAuth tokens at rest. */
  encryptionKey: z.string().min(32),
  providers: z.object({
    identity: z.enum(["supabase-auth", "mock"]).default("mock"),
    localListing: z.enum(["google-business-profile", "mock"]).default("mock"),
    searchPerformance: z.enum(["google-search-console", "mock"]).default("mock"),
    webAnalytics: z.enum(["google-analytics", "mock"]).default("mock"),
    bookingSource: z.enum(["square", "csv", "mock"]).default("mock"),
    webCrawler: z.enum(["firecrawl", "mock"]).default("mock"),
  }),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

const DEVELOPMENT_SESSION_SECRET = "reynav-development-session-secret-not-for-production";
const DEVELOPMENT_ENCRYPTION_KEY = "reynav-development-encryption-key-not-for-production";

function read(): AppConfig {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const parsed = ConfigSchema.safeParse({
    nodeEnv,
    useMockData: process.env.USE_MOCK_DATA,
    session: {
      secret: process.env.SESSION_SECRET ?? (nodeEnv === "production" ? undefined : DEVELOPMENT_SESSION_SECRET),
      cookieName: process.env.SESSION_COOKIE_NAME,
      maxAgeSeconds: process.env.SESSION_MAX_AGE_SECONDS,
    },
    encryptionKey: process.env.ENCRYPTION_KEY ?? (nodeEnv === "production" ? undefined : DEVELOPMENT_ENCRYPTION_KEY),
    providers: {
      identity: process.env.PROVIDER_IDENTITY,
      localListing: process.env.PROVIDER_LOCAL_LISTING,
      searchPerformance: process.env.PROVIDER_SEARCH_PERFORMANCE,
      webAnalytics: process.env.PROVIDER_WEB_ANALYTICS,
      bookingSource: process.env.PROVIDER_BOOKING_SOURCE,
      webCrawler: process.env.PROVIDER_WEB_CRAWLER,
    },
  });

  if (!parsed.success) {
    throw new ConfigError(`Invalid configuration: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

export const config: AppConfig = read();
