import "server-only";
// Supabase Auth implementation. Not wired yet: the credentials it needs are not in config, so the factory
// only reaches it once PROVIDER_IDENTITY is set to "supabase-auth" and this file is filled in.
import { ProviderUnavailableError } from "@/shared/errors";
import type { AuthIdentity, IdentityProvider, PasswordCredential } from "./types";

export class SupabaseAuthIdentityProvider implements IdentityProvider {
  async verifyPassword(_credential: PasswordCredential): Promise<AuthIdentity | null> {
    throw new ProviderUnavailableError("SupabaseAuthIdentityProvider is not implemented yet");
  }

  async createIdentity(_credential: PasswordCredential): Promise<AuthIdentity> {
    throw new ProviderUnavailableError("SupabaseAuthIdentityProvider is not implemented yet");
  }
}
