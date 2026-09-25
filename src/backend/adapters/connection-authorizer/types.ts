import "server-only";
// ConnectionAuthorizer: obtains credentials for an external account on behalf of one location.
//
// The real implementation is a redirect handshake driven by app/api/connections/[provider]/start and
// .../callback. `authorize` is what the callback calls once the provider hands back a code; the mock
// short-circuits the redirect entirely so the flow can be exercised offline.
import type { AuthorizableProvider } from "@/shared/types/connection";

export type AuthorizeInput = {
  provider: AuthorizableProvider;
  /** The provider's authorization code, or null when the authorizer does not need one (mock). */
  code: string | null;
  /** Which platform behind the capability, when there is a choice (e.g. which booking platform). */
  platformName?: string;
};

export type AuthorizedAccount = {
  /** Safe to display: an account name, a listing name, a property id. Never a token. */
  accountLabel: string;
  accessToken: string;
  /** Stored alongside the access token so an expiry can be recovered without the customer reconnecting. */
  refreshToken: string;
  expiresAt: string; // ISO 8601
};

export interface ConnectionAuthorizer {
  authorize(input: AuthorizeInput): Promise<AuthorizedAccount>;
}
