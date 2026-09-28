import "server-only";
// Mock IdentityProvider: a fixed demo identity plus any created by sign-up, stored in the database so every
// server instance sees them. Deterministic, offline, and a first-class implementation: it is what runs while
// USE_MOCK_DATA is on.
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import * as mockIdentitiesRepository from "@/backend/db/repositories/mock-identities";
import { ValidationError } from "@/shared/errors";
import type { AuthIdentity, IdentityProvider, PasswordCredential } from "./types";

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keyLength: number) => Promise<Buffer>;
const KEY_LENGTH = 32;

const DEMO = { authProviderId: "mock-auth-user-demo", email: "demo@gmail.com", password: "12345678" };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `${salt.toString("base64url")}.${key.toString("base64url")}`;
}

async function passwordMatches(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(".");
  if (!salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = await scrypt(password, Buffer.from(salt, "base64url"), expected.length);
  return timingSafeEqual(expected, actual);
}

export class MockIdentityProvider implements IdentityProvider {
  async verifyPassword({ email, password }: PasswordCredential): Promise<AuthIdentity | null> {
    const normalised = email.trim().toLowerCase();
    if (normalised === DEMO.email) {
      return password === DEMO.password ? { authProviderId: DEMO.authProviderId, email: DEMO.email } : null;
    }
    const stored = await mockIdentitiesRepository.findByEmail(normalised);
    if (!stored || !(await passwordMatches(password, stored.passwordHash))) return null;
    return { authProviderId: stored.authProviderId, email: stored.email };
  }

  async createIdentity({ email, password }: PasswordCredential): Promise<AuthIdentity> {
    const normalised = email.trim().toLowerCase();
    const created = {
      authProviderId: `mock-auth-${randomUUID()}`,
      email: normalised,
      passwordHash: await hashPassword(password),
    };
    if (normalised === DEMO.email || !(await mockIdentitiesRepository.create(created))) {
      throw new ValidationError("Identity already exists", "An account with that email already exists. Sign in instead.");
    }
    return { authProviderId: created.authProviderId, email: created.email };
  }
}

/** Shown on the sign-in screen while the mock provider is selected. */
export const demoCredential: PasswordCredential = { email: DEMO.email, password: DEMO.password };
