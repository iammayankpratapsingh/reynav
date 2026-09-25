// Settings: business details, connections, team, plan and what happens to your data.
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import { TeamInvites } from "./team-invites";
import { WeeklyReportSettings } from "./weekly-report-settings";
import { StatusBadge, type StatusTone } from "@/frontend/components/status-badge";
import type { SettingsCopy } from "@/frontend/copy/settings";
import { CONNECTION_PROVIDERS, type ConnectionStatus } from "@/shared/types/connection";
import type { SettingsView as View } from "@/shared/types/settings";
import styles from "./settings-view.module.css";

const tones: Record<ConnectionStatus, StatusTone> = {
  disconnected: "idle",
  connecting: "pending",
  connected: "success",
  needs_reconnect: "warning",
  failed: "danger",
};

export function SettingsView({ view, copy }: { view: View; copy: SettingsCopy }) {
  const byProvider = new Map(view.connections.map((connection) => [connection.provider, connection]));

  return (
    <div className={styles.page}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <Panel title={copy.business.heading}>
        <dl className={styles.definitions}>
          <div className={styles.row}>
            <dt>{copy.business.nameLabel}</dt>
            <dd>{view.businessName}</dd>
          </div>
          <div className={styles.row}>
            <dt>{copy.business.locationLabel}</dt>
            <dd>{view.locationLabel}</dd>
          </div>
          <div className={styles.row}>
            <dt>{copy.business.verticalLabel}</dt>
            <dd>{view.verticalName}</dd>
          </div>
          <div className={styles.row}>
            <dt>{copy.business.websiteLabel}</dt>
            <dd>{view.websiteUrl ?? <span className={styles.muted}>{copy.business.noWebsite}</span>}</dd>
          </div>
        </dl>
        <p className={styles.note}>{copy.business.editNote}</p>
      </Panel>

      <Panel
        title={copy.connections.heading}
        action={
          <Link href="/onboarding" className={styles.linkButton}>
            {copy.connections.manage}
          </Link>
        }
      >
        <ul className={styles.connections}>
          {CONNECTION_PROVIDERS.map((provider) => {
            const connection = byProvider.get(provider);
            const status: ConnectionStatus = connection?.status ?? "disconnected";
            return (
              <li key={provider} className={styles.connection}>
                <div>
                  <p className={styles.connectionName}>{copy.connections.labels[provider]}</p>
                  {connection?.accountLabel && <p className={styles.connectionMeta}>{connection.accountLabel}</p>}
                </div>
                <StatusBadge tone={tones[status]} label={copy.connections.status[status]} />
              </li>
            );
          })}
        </ul>
        <p className={styles.note}>{copy.connections.note}</p>
      </Panel>

      <Panel title={copy.team.heading}>
        <ul className={styles.team}>
          {view.team.map((member) => (
            <li key={member.id} className={styles.member}>
              <span className={styles.avatar} aria-hidden>
                {member.displayName.slice(0, 1)}
              </span>
              <div className={styles.memberBody}>
                <p className={styles.memberName}>
                  {member.displayName}
                  {member.isYou && <span className={styles.you}>{copy.team.youLabel}</span>}
                </p>
                <p className={styles.memberEmail}>{member.email}</p>
              </div>
              <span className={styles.role}>{member.role}</span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          {copy.team.seatsPrefix} {view.seatsUsed} of {view.seatsIncluded} {copy.team.seatsSuffix}.{" "}
          {copy.team.inviteNote}
        </p>
        <TeamInvites
          copy={copy.team}
          invitations={view.invitations}
          canManage={view.canManageTeam}
          isEmailSimulated={view.isEmailSimulated}
        />
      </Panel>

      <Panel title={copy.reports.heading}>
        <WeeklyReportSettings
          copy={copy.reports}
          initial={view.reports}
          canManage={view.canManageTeam}
          isEmailSimulated={view.isEmailSimulated}
        />
      </Panel>

      <Panel title={copy.plan.heading}>
        <div className={styles.plan}>
          <div>
            <p className={styles.planLabel}>{copy.plan.currentLabel}</p>
            <p className={styles.planName}>{view.planName}</p>
          </div>
          <Link href="/pricing" className={styles.linkButton}>
            {copy.plan.viewPricing}
          </Link>
        </div>
        <p className={styles.note}>{copy.plan.trialNote}</p>
      </Panel>

      <Panel title={copy.data.heading}>
        <ul className={styles.dataPoints}>
          {copy.data.points.map((point) => (
            <li key={point} className={styles.dataPoint}>
              <ShieldCheck aria-hidden size={17} />
              {point}
            </li>
          ))}
        </ul>
        <div className={styles.dataActions}>
          <button type="button" className={styles.secondaryButton} disabled>
            <Lock aria-hidden size={16} />
            {copy.data.exportLabel}
          </button>
          <button type="button" className={styles.dangerButton} disabled>
            {copy.data.deleteLabel}
          </button>
        </div>
        <p className={styles.note}>{copy.data.destructiveNote}</p>
      </Panel>
    </div>
  );
}
