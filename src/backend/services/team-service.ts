import "server-only";
// Team: inviting people to the organisation with a role, and withdrawing invitations. Owners and managers
// only. The invitation email goes through the EmailSender adapter.
import { getEmailSender } from "@/backend/adapters/email-sender";
import * as invitationsRepository from "@/backend/db/repositories/invitations";
import * as organizationsRepository from "@/backend/db/repositories/organizations";
import * as usersRepository from "@/backend/db/repositories/users";
import { logger } from "@/backend/lib/logger";
import { canManageConnections } from "@/shared/constants/roles";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/shared/errors";
import { InviteSchema } from "@/shared/schemas/account";
import type { TenantContext } from "@/shared/types/tenant";

/** Seats included in the trial: members plus pending invitations. */
export const TRIAL_SEATS = 5;

function requireTeamManager(ctx: TenantContext): void {
  if (!canManageConnections(ctx.role)) {
    throw new UnauthorizedError("Role may not manage the team", "Only owners and managers can invite people.");
  }
}

export async function invite(ctx: TenantContext, input: unknown): Promise<void> {
  requireTeamManager(ctx);
  const { email, role } = InviteSchema.parse(input);
  const normalised = email.trim().toLowerCase();

  const [members, pending, organization] = await Promise.all([
    usersRepository.listForOrganization(ctx),
    invitationsRepository.listPending(ctx),
    organizationsRepository.findForContext(ctx),
  ]);
  if (members.some((member) => member.email.toLowerCase() === normalised)) {
    throw new ValidationError("Invitee already a member", "That person is already on your team.");
  }
  if (pending.some((invitation) => invitation.email === normalised)) {
    throw new ValidationError("Invitee already invited", "That person already has an invitation waiting.");
  }
  if (members.length + pending.length >= TRIAL_SEATS) {
    throw new ValidationError(
      "Seat limit reached",
      `Your trial includes ${TRIAL_SEATS} seats. Remove someone to invite another.`,
    );
  }

  await invitationsRepository.create(ctx, { email: normalised, role });
  await getEmailSender().send({
    to: [normalised],
    subject: `You're invited to ${organization?.name ?? "a team"} on REYNAV`,
    text: `You've been invited to join ${organization?.name ?? "a team"} on REYNAV as a ${role}. Open REYNAV to accept.`,
  });
  logger.info({ message: "team invitation sent", organizationId: ctx.organizationId, role });
}

export async function revoke(ctx: TenantContext, invitationId: string): Promise<void> {
  requireTeamManager(ctx);
  if (!(await invitationsRepository.revoke(ctx, invitationId))) {
    throw new NotFoundError(`No invitation ${invitationId} for ${ctx.organizationId}`);
  }
}

export function canManageTeam(ctx: TenantContext): boolean {
  return canManageConnections(ctx.role);
}
