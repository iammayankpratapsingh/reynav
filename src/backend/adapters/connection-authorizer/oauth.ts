import "server-only";
// Real OAuth implementation. Left unimplemented until client credentials exist in config; the factory only
// reaches it once USE_MOCK_DATA is off.
import { ProviderUnavailableError } from "@/shared/errors";
import type { AuthorizeInput, AuthorizedAccount, ConnectionAuthorizer } from "./types";

export class OAuthConnectionAuthorizer implements ConnectionAuthorizer {
  async authorize(_input: AuthorizeInput): Promise<AuthorizedAccount> {
    throw new ProviderUnavailableError("OAuthConnectionAuthorizer is not implemented yet");
  }
}
