import "server-only";
// Accounts created by sign-up while the mock identity provider is selected. Not tenant data: it is what sign-in
// resolves before any organisation is known. Only the mock IdentityProvider reads it.
import { getSql } from "@/backend/db/client";

export type StoredMockIdentity = { authProviderId: string; email: string; passwordHash: string };

export async function findByEmail(email: string): Promise<StoredMockIdentity | null> {
  const [row] = await getSql()<{ auth_provider_id: string; email: string; password_hash: string }[]>`
    select auth_provider_id, email, password_hash from mock_identities where email = ${email}
  `;
  return row ? { authProviderId: row.auth_provider_id, email: row.email, passwordHash: row.password_hash } : null;
}

/** Returns false when the email is already taken. */
export async function create(identity: StoredMockIdentity): Promise<boolean> {
  const inserted = await getSql()`
    insert into mock_identities (auth_provider_id, email, password_hash)
    values (${identity.authProviderId}, ${identity.email}, ${identity.passwordHash})
    on conflict (email) do nothing
  `;
  return inserted.count > 0;
}
