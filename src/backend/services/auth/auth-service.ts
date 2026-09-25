import "server-only";
// Sign-in: verify the credential with the identity provider, then resolve our own user row.
// The provider proves who someone is. Our users table decides what they can do.
import { getIdentityProvider } from "@/backend/adapters/identity-provider";
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as locationsRepository from "@/backend/db/repositories/locations";
import * as organizationsRepository from "@/backend/db/repositories/organizations";
import * as usersRepository from "@/backend/db/repositories/users";
import { logger } from "@/backend/lib/logger";
import { UnauthorizedError } from "@/shared/errors";
import { SignUpSchema } from "@/shared/schemas/account";
import type { TenantContext } from "@/shared/types/tenant";
import type { User } from "@/shared/types/user";
import { featuredVerticalId } from "@/verticals";
import { clearSession, writeSession } from "./session";

const INVALID_CREDENTIAL = "That email and password do not match an account.";

export async function signIn(input: { email: string; password: string }): Promise<User> {
  const identity = await getIdentityProvider().verifyPassword(input);
  if (!identity) {
    logger.info({ message: "sign-in rejected" });
    throw new UnauthorizedError("Identity provider rejected the credential", INVALID_CREDENTIAL);
  }

  const user = await usersRepository.findByAuthProviderIdAcrossOrganizations(identity.authProviderId);
  if (!user) {
    logger.warn({ message: "verified identity has no user row", authProviderId: identity.authProviderId });
    throw new UnauthorizedError("No user row for identity", INVALID_CREDENTIAL);
  }
  if (user.role === "system") {
    throw new UnauthorizedError("System accounts cannot sign in", INVALID_CREDENTIAL);
  }

  await writeSession({ userId: user.id, organizationId: user.organizationId, role: user.role });
  logger.info({ message: "sign-in accepted", organizationId: user.organizationId });
  return user;
}

/**
 * Sign-up: create the identity, then everything a tenant needs — organisation, owner, business and a first
 * location — and sign them in. Onboarding fills in the rest.
 */
export async function signUp(input: unknown): Promise<User> {
  const parsed = SignUpSchema.parse(input);
  const identity = await getIdentityProvider().createIdentity({ email: parsed.email, password: parsed.password });

  const organization = await organizationsRepository.create({ name: parsed.businessName });
  const ctx: TenantContext = { organizationId: organization.id, userId: null, role: "system" };
  const user = await usersRepository.create(ctx, {
    authProviderId: identity.authProviderId,
    email: identity.email,
    displayName: parsed.name,
    role: "owner",
  });
  const business = await businessesRepository.create(ctx, { name: parsed.businessName, verticalId: featuredVerticalId });
  await locationsRepository.createFirst(ctx, { businessId: business.id, label: "Main location" });

  await writeSession({ userId: user.id, organizationId: organization.id, role: "owner" });
  logger.info({ message: "account created", organizationId: organization.id });
  return user;
}

export async function signOut(): Promise<void> {
  await clearSession();
}
