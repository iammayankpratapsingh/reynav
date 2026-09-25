import "server-only";
// Onboarding connections: website, Google sources, booking platform and the location's address.
// Business logic only — the handshake belongs to the ConnectionAuthorizer adapter, storage to the repositories.
import { getConnectionAuthorizer } from "@/backend/adapters/connection-authorizer";
import { getLocalListingSource } from "@/backend/adapters/local-listing";
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as connectionsRepository from "@/backend/db/repositories/external-connections";
import * as locationsRepository from "@/backend/db/repositories/locations";
import { encrypt } from "@/backend/lib/encryption";
import { logger } from "@/backend/lib/logger";
import { bookingPlatformName, type BookingPlatformId } from "@/shared/constants/booking-platforms";
import { canManageConnections } from "@/shared/constants/roles";
import { UnauthorizedError } from "@/shared/errors";
import { PostalAddressSchema, SetWebsiteSchema } from "@/shared/schemas/business";
import type { AuthorizableProvider, ConnectionProvider } from "@/shared/types/connection";
import type { OnboardingState } from "@/shared/types/onboarding";
import type { TenantContext } from "@/shared/types/tenant";
import { getOnboardingState, requirePrimaryBusiness, requirePrimaryLocation } from "./onboarding-service";

export function requireManager(ctx: TenantContext): void {
  if (!canManageConnections(ctx.role)) {
    throw new UnauthorizedError("Role may not manage connections", "You do not have permission to change connections.");
  }
}

/** Saves the website address. Returns the normalised URL so the caller can read the site straight away. */
export async function setWebsite(ctx: TenantContext, input: unknown): Promise<string> {
  requireManager(ctx);
  const { websiteUrl } = SetWebsiteSchema.parse(input);

  const [business, location] = await Promise.all([requirePrimaryBusiness(ctx), requirePrimaryLocation(ctx)]);

  await businessesRepository.setWebsiteUrl(ctx, business.id, websiteUrl);
  await connectionsRepository.upsert(ctx, {
    locationId: location.id,
    provider: "website",
    status: "connected",
    accountLabel: new URL(websiteUrl).hostname,
    connectedAt: new Date().toISOString(),
    lastErrorCode: null,
    encryptedTokens: null,
  });

  logger.info({ message: "website set", organizationId: ctx.organizationId });
  return websiteUrl;
}

export async function connect(
  ctx: TenantContext,
  provider: AuthorizableProvider,
  platformName?: string,
): Promise<OnboardingState> {
  requireManager(ctx);
  const location = await requirePrimaryLocation(ctx);

  try {
    const account = await getConnectionAuthorizer().authorize({ provider, code: null, platformName });
    await connectionsRepository.upsert(ctx, {
      locationId: location.id,
      provider,
      status: "connected",
      accountLabel: account.accountLabel,
      connectedAt: new Date().toISOString(),
      lastErrorCode: null,
      encryptedTokens: encrypt(JSON.stringify({ access: account.accessToken, refresh: account.refreshToken })),
    });
    logger.info({ message: "connection authorized", organizationId: ctx.organizationId, provider });
  } catch (error) {
    const code = error instanceof Error ? error.name : "unknown";
    await connectionsRepository.upsert(ctx, {
      locationId: location.id,
      provider,
      status: "failed",
      accountLabel: null,
      connectedAt: null,
      lastErrorCode: code,
      encryptedTokens: null,
    });
    logger.warn({ message: "connection failed", organizationId: ctx.organizationId, provider, code });
    return getOnboardingState(ctx);
  }

  if (provider === "local-listing") await fillAddressFromListing(ctx);
  return getOnboardingState(ctx);
}

export async function connectBookingPlatform(
  ctx: TenantContext,
  platformId: BookingPlatformId,
): Promise<OnboardingState> {
  return connect(ctx, "booking-source", bookingPlatformName(platformId));
}

/**
 * A connected listing usually knows the address, so the owner does not have to type it. An address the
 * owner typed themselves is never overwritten.
 */
async function fillAddressFromListing(ctx: TenantContext): Promise<void> {
  const location = await requirePrimaryLocation(ctx);
  if (location.addressSource === "manual") return;

  const snapshot = await getLocalListingSource().getSnapshot({ locationRef: location.id });
  if (!snapshot.address) return;
  await locationsRepository.saveAddress(ctx, location.id, snapshot.address, "listing");
  logger.info({ message: "address filled from listing", organizationId: ctx.organizationId });
}

export async function saveAddress(ctx: TenantContext, input: unknown): Promise<OnboardingState> {
  requireManager(ctx);
  const address = PostalAddressSchema.parse(input);
  const location = await requirePrimaryLocation(ctx);

  // Saving what the listing filled in unchanged keeps it marked as fetched, not typed.
  const isUnchanged =
    location.addressSource === "listing" &&
    location.address !== null &&
    (Object.keys(address) as (keyof typeof address)[]).every((key) => address[key] === location.address?.[key]);

  await locationsRepository.saveAddress(ctx, location.id, address, isUnchanged ? "listing" : "manual");
  return getOnboardingState(ctx);
}

export async function disconnect(ctx: TenantContext, provider: ConnectionProvider): Promise<OnboardingState> {
  requireManager(ctx);
  const location = await requirePrimaryLocation(ctx);
  await connectionsRepository.remove(ctx, location.id, provider);
  if (provider === "website") {
    const business = await businessesRepository.findPrimary(ctx);
    if (business) await businessesRepository.setWebsiteUrl(ctx, business.id, null);
  }
  return getOnboardingState(ctx);
}
