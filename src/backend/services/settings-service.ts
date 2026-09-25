import "server-only";
// Everything the settings screen shows, gathered from the repositories that own each piece.
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as connectionsRepository from "@/backend/db/repositories/external-connections";
import * as locationsRepository from "@/backend/db/repositories/locations";
import * as usersRepository from "@/backend/db/repositories/users";
import { NotFoundError } from "@/shared/errors";
import type { SettingsView } from "@/shared/types/settings";
import type { TenantContext } from "@/shared/types/tenant";
import { getVertical } from "@/verticals";
import { isSimulatedEmail } from "@/backend/adapters/email-sender";
import * as invitationsRepository from "@/backend/db/repositories/invitations";
import { getPreferences } from "./report-email-service";
import { canManageTeam, TRIAL_SEATS } from "./team-service";


export async function getSettings(ctx: TenantContext): Promise<SettingsView> {
  const [business, location] = await Promise.all([
    businessesRepository.findPrimary(ctx),
    locationsRepository.findPrimary(ctx),
  ]);
  if (!business || !location) throw new NotFoundError(`Incomplete workspace for ${ctx.organizationId}`);

  const [connections, members, invitations, reports] = await Promise.all([
    connectionsRepository.listForLocation(ctx, location.id),
    usersRepository.listForOrganization(ctx),
    invitationsRepository.listPending(ctx),
    getPreferences(ctx),
  ]);

  return {
    businessName: business.name,
    locationLabel: location.label,
    verticalName: getVertical(business.verticalId).manifest.displayName,
    websiteUrl: business.websiteUrl,
    connections,
    team: members.map((member) => ({
      id: member.id,
      displayName: member.displayName,
      email: member.email,
      role: member.role,
      isYou: member.id === ctx.userId,
    })),
    seatsUsed: members.length + invitations.length,
    seatsIncluded: TRIAL_SEATS,
    planName: "Free trial",
    invitations,
    canManageTeam: canManageTeam(ctx),
    reports,
    isEmailSimulated: isSimulatedEmail(),
  };
}
