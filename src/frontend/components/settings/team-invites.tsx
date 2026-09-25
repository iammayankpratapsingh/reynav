"use client";
// Inviting teammates with a role, and the invitations still waiting.
import { useActionState, useTransition } from "react";
import { inviteAction, revokeInviteAction, type InviteState } from "@/app/(app)/settings/actions";
import type { SettingsCopy } from "@/frontend/copy/settings";
import { INVITABLE_ROLES } from "@/shared/schemas/account";
import type { Invitation } from "@/shared/types/settings";
import data from "@/frontend/components/app/data.module.css";
import styles from "./settings-view.module.css";

const initial: InviteState = { error: null, sentTo: null };

type Props = {
  copy: SettingsCopy["team"];
  invitations: readonly Invitation[];
  canManage: boolean;
  isEmailSimulated: boolean;
};

export function TeamInvites({ copy, invitations, canManage, isEmailSimulated }: Props) {
  const [state, formAction, isPending] = useActionState(inviteAction, initial);
  const [isRevoking, startRevoke] = useTransition();

  return (
    <div className={styles.invites}>
      {invitations.length > 0 && (
        <>
          <h3 className={styles.subheading}>{copy.pendingHeading}</h3>
          <ul className={data.list}>
            {invitations.map((invitation) => (
              <li key={invitation.id} className={data.listItem}>
                <div>
                  <p className={data.listTitle}>{invitation.email}</p>
                  <p className={data.listSub}>
                    {copy.roles[invitation.role as keyof typeof copy.roles] ?? invitation.role} · {copy.pendingLabel}
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    className={data.button}
                    disabled={isRevoking}
                    onClick={() => startRevoke(async () => void (await revokeInviteAction(invitation.id)))}
                  >
                    {copy.revoke}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {canManage ? (
        <form action={formAction} className={styles.inviteForm}>
          <h3 className={styles.subheading}>{copy.inviteHeading}</h3>
          <div className={styles.inviteRow}>
            <label className={styles.inviteField}>
              <span>{copy.emailLabel}</span>
              <input name="email" type="email" required className={data.input} placeholder="teammate@yourbusiness.ca" />
            </label>
            <label className={styles.inviteField}>
              <span>{copy.roleLabel}</span>
              <select name="role" className={data.select} defaultValue="manager">
                {INVITABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {copy.roles[role]}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={data.button} data-variant="primary" disabled={isPending}>
              {isPending ? copy.sending : copy.send}
            </button>
          </div>
          <p className={data.note}>{copy.roleHelp}</p>
          {state.error && (
            <p role="alert" className={styles.formError}>
              {state.error}
            </p>
          )}
          {state.sentTo && (
            <p role="status" className={styles.formSuccess}>
              {(isEmailSimulated ? copy.sentSimulated : copy.sent).replace("{email}", state.sentTo)}
            </p>
          )}
        </form>
      ) : (
        <p className={data.note}>{copy.onlyManagers}</p>
      )}
    </div>
  );
}
