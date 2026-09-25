import "server-only";
// Factory selecting the IdentityProvider from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockIdentityProvider } from "./mock";
import { SupabaseAuthIdentityProvider } from "./supabase-auth";
import type { IdentityProvider } from "./types";

export function getIdentityProvider(): IdentityProvider {
  if (config.useMockData) return new MockIdentityProvider();
  switch (config.providers.identity) {
    case "supabase-auth":
      return new SupabaseAuthIdentityProvider();
    case "mock":
      return new MockIdentityProvider();
    default:
      throw new ConfigError("Unknown identity provider");
  }
}

/** True while sign-in is served by the mock, so the UI may offer the demo credential. */
export function isMockIdentity(): boolean {
  return config.useMockData || config.providers.identity === "mock";
}
