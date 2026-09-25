import "server-only";
// The onboarding wizard's state: the business as detected and confirmed, its connections and booking data.
// Read-only; the services that change each part return this after they write.
import { isSimulatedConnection } from "@/backend/adapters/connection-authorizer";
import * as bookingsRepository from "@/backend/db/repositories/bookings";
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as connectionsRepository from "@/backend/db/repositories/external-connections";
import * as locationsRepository from "@/backend/db/repositories/locations";
import { BOOKING_PLATFORMS, type BookingPlatformId } from "@/shared/constants/booking-platforms";
import { NotFoundError } from "@/shared/errors";
import type { Business, Location } from "@/shared/types/business";
import type { Connection, ConnectionProvider } from "@/shared/types/connection";
import { ONBOARDING_PROVIDERS, type OnboardingState } from "@/shared/types/onboarding";
import type { TenantContext } from "@/shared/types/tenant";
import { getVertical } from "@/verticals";

const SERVICE_EXAMPLE_COUNT = 3;

export async function requirePrimaryBusiness(ctx: TenantContext): Promise<Business> {
  const business = await businessesRepository.findPrimary(ctx);
  if (!business) throw new NotFoundError(`No business for organisation ${ctx.organizationId}`);
  return business;
}

export async function requirePrimaryLocation(ctx: TenantContext): Promise<Location> {
  const location = await locationsRepository.findPrimary(ctx);
  if (!location) throw new NotFoundError(`No location for organisation ${ctx.organizationId}`);
  return location;
}

function disconnected(provider: ConnectionProvider): Connection {
  return { provider, status: "disconnected", accountLabel: null, connectedAt: null, lastErrorCode: null };
}

/** The booking connection's label starts with the platform name, e.g. "Square — primary location". */
function platformFromLabel(connection: Connection | undefined): BookingPlatformId | null {
  if (connection?.status !== "connected" || !connection.accountLabel) return null;
  const name = connection.accountLabel.split("—")[0]?.trim().toLowerCase();
  return BOOKING_PLATFORMS.find((platform) => platform.name.toLowerCase() === name)?.id ?? null;
}

export async function getOnboardingState(ctx: TenantContext): Promise<OnboardingState> {
  const [business, location] = await Promise.all([requirePrimaryBusiness(ctx), requirePrimaryLocation(ctx)]);
  const [stored, bookingImport] = await Promise.all([
    connectionsRepository.listForLocation(ctx, location.id),
    bookingsRepository.findLatestImport(ctx, location.id),
  ]);

  const byProvider = new Map(stored.map((connection) => [connection.provider, connection]));
  const connections = ONBOARDING_PROVIDERS.map((provider) => byProvider.get(provider) ?? disconnected(provider));
  const pack = getVertical(business.verticalId);

  const ownServices = business.profile?.services ?? [];
  const serviceExamples = (ownServices.length > 0 ? ownServices : pack.services.map((service) => service.name)).slice(
    0,
    SERVICE_EXAMPLE_COUNT,
  );

  return {
    businessName: business.name,
    verticalId: business.verticalId,
    websiteUrl: business.websiteUrl,
    businessTypes: pack.manifest.businessTypes.map(({ id, name }) => ({ id, name })),
    profile: business.profile,
    locationLabel: location.label,
    address: location.address,
    addressSource: location.addressSource,
    connections,
    bookingPlatformId: platformFromLabel(byProvider.get("booking-source")),
    bookingImport,
    serviceExamples,
    canStartAnalysis: business.websiteUrl !== null && Boolean(business.profile?.businessTypeId),
    isOnboarded: business.onboardedAt !== null,
    isSimulated: isSimulatedConnection(),
  };
}

export async function isOnboarded(ctx: TenantContext): Promise<boolean> {
  const business = await businessesRepository.findPrimary(ctx);
  return business?.onboardedAt != null;
}
