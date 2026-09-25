import "server-only";
// IdentityProvider interface: verify a credential and return auth_provider_id.
// The provider is an identity source only. Our users table stays the source of truth for roles and membership.

export type AuthIdentity = {
  /** The provider's own id for this identity, stored on our user row as auth_provider_id. */
  authProviderId: string;
  email: string;
};

export type PasswordCredential = {
  email: string;
  password: string;
};

export interface IdentityProvider {
  /** Returns the identity when the credential is valid, or null when it is not. */
  verifyPassword(credential: PasswordCredential): Promise<AuthIdentity | null>;
  /** Creates an identity. Throws ValidationError when the email is already registered. */
  createIdentity(credential: PasswordCredential): Promise<AuthIdentity>;
}
