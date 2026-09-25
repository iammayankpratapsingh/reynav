import "server-only";
// Mock IdentityProvider: a fixed demo identity plus any created by sign-up, kept in memory for the process.
// Deterministic, offline, and a first-class implementation: it is what runs while USE_MOCK_DATA is on.
import { ValidationError } from "@/shared/errors";
import type { AuthIdentity, IdentityProvider, PasswordCredential } from "./types";

type StoredIdentity = AuthIdentity & { password: string };

const DEMO: StoredIdentity = { authProviderId: "mock-auth-user-demo", email: "demo@gmail.com", password: "12345678" };

// Survives hot reloads in development, like the mock database, so a new account keeps working.
const globalForIdentities = globalThis as typeof globalThis & { __reynavIdentities?: StoredIdentity[] };
const identities: StoredIdentity[] = (globalForIdentities.__reynavIdentities ??= [DEMO]);

export class MockIdentityProvider implements IdentityProvider {
  async verifyPassword({ email, password }: PasswordCredential): Promise<AuthIdentity | null> {
    const normalised = email.trim().toLowerCase();
    const match = identities.find((identity) => identity.email === normalised && identity.password === password);
    if (!match) return null;
    return { authProviderId: match.authProviderId, email: match.email };
  }

  async createIdentity({ email, password }: PasswordCredential): Promise<AuthIdentity> {
    const normalised = email.trim().toLowerCase();
    if (identities.some((identity) => identity.email === normalised)) {
      throw new ValidationError("Identity already exists", "An account with that email already exists. Sign in instead.");
    }
    const created = { authProviderId: `mock-auth-${Date.now().toString(36)}`, email: normalised, password };
    identities.push(created);
    return { authProviderId: created.authProviderId, email: created.email };
  }
}

/** Shown on the sign-in screen while the mock provider is selected. */
export const demoCredential: PasswordCredential = { email: DEMO.email, password: DEMO.password };
