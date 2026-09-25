import "server-only";
// Mock ConnectionAuthorizer: deterministic, offline, realistic labels. First-class implementation, not a test helper.
import type { AuthorizableProvider } from "@/shared/types/connection";
import type { AuthorizeInput, AuthorizedAccount, ConnectionAuthorizer } from "./types";

// Shapes a real provider would return, with no tenant or vertical knowledge in them.
const accountLabels: Record<AuthorizableProvider, string> = {
  "local-listing": "Business profile — primary location",
  "search-performance": "sc-domain property",
  "web-analytics": "GA4 property 412 908 331",
  "booking-source": "Booking account — primary location",
};

/** Simulates the round trip to the provider so the UI shows a real pending state. */
const HANDSHAKE_MS = 900;

export class MockConnectionAuthorizer implements ConnectionAuthorizer {
  async authorize({ provider, platformName }: AuthorizeInput): Promise<AuthorizedAccount> {
    await new Promise((resolve) => setTimeout(resolve, HANDSHAKE_MS));
    return {
      accountLabel: platformName ? `${platformName} — primary location` : accountLabels[provider],
      accessToken: `mock-access-${provider}`,
      refreshToken: `mock-refresh-${provider}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }
}
