import "server-only";
// The profile: the signed-in person, the business, its locations and connections, and a checklist of what
// would make the setup complete. Reads what the other services and repositories already hold.
import { z } from "zod";
import * as bookingsRepository from "@/backend/db/repositories/bookings";
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as connectionsRepository from "@/backend/db/repositories/external-connections";
import * as invitationsRepository from "@/backend/db/repositories/invitations";
import * as locationsRepository from "@/backend/db/repositories/locations";
import * as organizationsRepository from "@/backend/db/repositories/organizations";
import * as servicesRepository from "@/backend/db/repositories/services";
import * as usersRepository from "@/backend/db/repositories/users";
import { NotFoundError } from "@/shared/errors";
import { canManageConnections } from "@/shared/constants/roles";
import { CONNECTION_PROVIDERS } from "@/shared/types/connection";
import type { ProfileView } from "@/shared/types/profile";
import type { TenantContext } from "@/shared/types/tenant";
import { getVertical } from "@/verticals";
import { requireManager } from "./connection-service";
import { getDashboard } from "./dashboard-service";
import { getPreferences } from "./report-email-service";

const NameSchema = z.string().trim().min(1, "Enter a name.").max(160, "That name is too long.");

export async function getProfile(ctx: TenantContext): Promise<ProfileView> {
  const [user, organization, business, locations, active] = await Promise.all([
    ctx.userId ? usersRepository.findById(ctx, ctx.userId) : Promise.resolve(null),
    organizationsRepository.findForContext(ctx),
    businessesRepository.findPrimary(ctx),
    locationsRepository.listAll(ctx),
    locationsRepository.findPrimary(ctx),
  ]);
  if (!user || !organization || !business || !active)
    throw new NotFoundError(`Incomplete profile for ${ctx.organizationId}`);

  const [connections, members, invitations, dashboard, reports, bookings, economics] = await Promise.all([
    connectionsRepository.listForLocation(ctx, active.id),
    usersRepository.listForOrganization(ctx),
    invitationsRepository.listPending(ctx),
    getDashboard(ctx),
    getPreferences(ctx),
    bookingsRepository.findLatestImport(ctx, active.id),
    servicesRepository.listEconomics(ctx, active.id),
  ]);

  const pack = getVertical(business.verticalId);
  const byProvider = new Map(connections.map((connection) => [connection.provider, connection]));
  const isConnected = (provider: (typeof CONNECTION_PROVIDERS)[number]) =>
    byProvider.get(provider)?.status === "connected";
  const services = business.profile?.services ?? [];

  return {
    user: { displayName: user.displayName, email: user.email, role: user.role },
    business: {
      name: business.name,
      typeName: pack.manifest.businessTypes.find((type) => type.id === business.profile?.businessTypeId)?.name ?? null,
      verticalName: pack.manifest.displayName,
      websiteUrl: business.websiteUrl,
      services,
      segments: business.profile?.segments ?? [],
      memberSince: organization.createdAt,
    },
    activeLocationLabel: active.label,
    locations: locations.map((location) => ({
      id: location.id,
      label: location.label,
      address: location.address
        ? [location.address.street, location.address.city, location.address.region, location.address.postalCode]
            .filter(Boolean)
            .join(", ")
        : null,
      isActive: location.id === active.id,
    })),
    connections: CONNECTION_PROVIDERS.map((provider) => ({
      provider,
      status: byProvider.get(provider)?.status ?? "disconnected",
      accountLabel: byProvider.get(provider)?.accountLabel ?? null,
    })),
    stats: {
      growthScore: dashboard.scores.growth?.value ?? null,
      locationCount: locations.length,
      serviceCount: services.length,
      teamCount: members.length,
    },
    weeklyReportOn: reports.weeklyEnabled,
    checklist: [
      { id: "website", isDone: business.websiteUrl !== null, href: "/onboarding" },
      { id: "services", isDone: services.length > 0, href: "/onboarding" },
      { id: "address", isDone: active.address !== null, href: "/onboarding" },
      { id: "listing", isDone: isConnected("local-listing"), href: "/onboarding" },
      { id: "bookings", isDone: isConnected("booking-source") || bookings !== null, href: "/onboarding" },
      { id: "team", isDone: members.length + invitations.length > 1, href: "/settings" },
      { id: "prices", isDone: economics.size > 0, href: "/services" },
    ],
    canEditBusiness: canManageConnections(ctx.role),
  };
}

export async function updateDisplayName(ctx: TenantContext, input: unknown): Promise<ProfileView> {
  if (!ctx.userId) throw new NotFoundError("No signed-in user");
  await usersRepository.updateDisplayName(ctx, ctx.userId, NameSchema.parse(input));
  return getProfile(ctx);
}

/** The business name is also the organisation's name everywhere it is shown, so both change together. */
export async function renameBusiness(ctx: TenantContext, input: unknown): Promise<ProfileView> {
  requireManager(ctx);
  const name = NameSchema.parse(input);
  const business = await businessesRepository.findPrimary(ctx);
  if (!business) throw new NotFoundError(`No business for ${ctx.organizationId}`);
  await Promise.all([businessesRepository.rename(ctx, business.id, name), organizationsRepository.rename(ctx, name)]);
  return getProfile(ctx);
}
