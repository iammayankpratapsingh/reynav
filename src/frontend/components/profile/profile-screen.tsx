"use client";
// The profile: a banner with the business and its headline numbers, how complete the setup is, and cards
// for your details, the business, locations, connections and preferences. Names can be edited in place.
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, LogOut, MapPin, Pencil, Sparkles, Store } from "lucide-react";
import { useState, useTransition } from "react";
import { signOutAction } from "@/app/(app)/actions";
import { renameBusinessAction, updateDisplayNameAction, type ProfileResult } from "@/app/(app)/profile/actions";
import type { ProfileCopy } from "@/frontend/copy/profile";
import type { ProfileView } from "@/shared/types/profile";
import styles from "./profile-screen.module.css";

type Props = { initial: ProfileView; copy: ProfileCopy };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ProfileScreen({ initial, copy }: Props) {
  const [profile, setProfile] = useState(initial);
  const done = profile.checklist.filter((check) => check.isDone).length;
  const percent = Math.round((done / profile.checklist.length) * 100);
  const memberSince = new Date(profile.business.memberSince).toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  const stats = [
    {
      label: copy.stats.growthScore,
      value: profile.stats.growthScore === null ? copy.stats.notScored : String(profile.stats.growthScore),
    },
    { label: copy.stats.locations, value: String(profile.stats.locationCount) },
    { label: copy.stats.services, value: String(profile.stats.serviceCount) },
    { label: copy.stats.team, value: String(profile.stats.teamCount) },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label={copy.title}>
        <div className={styles.cover} aria-hidden />
        <div className={styles.heroBody}>
          <span className={styles.avatar} aria-hidden>
            {initials(profile.business.name)}
          </span>
          <div className={styles.identity}>
            <h1 className={styles.name}>{profile.business.name}</h1>
            <ul className={styles.tags}>
              <li className={styles.tag}>
                <MapPin aria-hidden size={14} />
                {profile.activeLocationLabel}
              </li>
              {profile.business.typeName && (
                <li className={styles.tag}>
                  <Store aria-hidden size={14} />
                  {profile.business.typeName}
                </li>
              )}
              <li className={styles.tagMuted}>{copy.memberSince.replace("{date}", memberSince)}</li>
            </ul>
          </div>
          {profile.business.websiteUrl && (
            <a href={profile.business.websiteUrl} target="_blank" rel="noreferrer" className={styles.websiteButton}>
              {hostOf(profile.business.websiteUrl)}
              <ExternalLink aria-hidden size={15} />
              <span className={styles.srOnly}>{copy.visitWebsite}</span>
            </a>
          )}
        </div>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className={styles.columns}>
        <div className={styles.column}>
          <section className={styles.card} aria-labelledby="strength-heading">
            <div className={styles.strength}>
              <StrengthRing percent={percent} label={copy.completeness.percent.replace("{percent}", String(percent))} />
              <div>
                <h2 id="strength-heading" className={styles.cardTitle}>
                  {copy.completeness.heading}
                </h2>
                <p className={styles.cardIntro}>
                  {percent === 100 ? copy.completeness.allDone : copy.completeness.intro}
                </p>
              </div>
            </div>
            <ul className={styles.checklist}>
              {profile.checklist.map((check) => (
                <li key={check.id} className={styles.check} data-done={check.isDone}>
                  <span className={styles.checkMark} aria-hidden>
                    {check.isDone ? <Check size={13} strokeWidth={3} /> : <Sparkles size={13} />}
                  </span>
                  <span className={styles.checkLabel}>{copy.completeness.checks[check.id]}</span>
                  {!check.isDone && (
                    <Link href={check.href} className={styles.checkLink}>
                      {copy.completeness.fix}
                      <ArrowRight aria-hidden size={14} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card} aria-labelledby="you-heading">
            <h2 id="you-heading" className={styles.cardTitle}>
              {copy.you.heading}
            </h2>
            <dl className={styles.fields}>
              <EditableField
                label={copy.you.name}
                value={profile.user.displayName}
                copy={copy}
                onSave={updateDisplayNameAction}
                onSaved={setProfile}
              />
              <div className={styles.field}>
                <dt>{copy.you.email}</dt>
                <dd>{profile.user.email}</dd>
              </div>
              <div className={styles.field}>
                <dt>{copy.you.role}</dt>
                <dd>
                  <span className={styles.rolePill}>{copy.you.roles[profile.user.role]}</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className={styles.card} aria-labelledby="business-heading">
            <h2 id="business-heading" className={styles.cardTitle}>
              {copy.business.heading}
            </h2>
            <dl className={styles.fields}>
              <EditableField
                label={copy.business.name}
                value={profile.business.name}
                copy={copy}
                isEditable={profile.canEditBusiness}
                onSave={renameBusinessAction}
                onSaved={setProfile}
              />
              <div className={styles.field}>
                <dt>{copy.business.type}</dt>
                <dd>{profile.business.typeName ?? copy.business.notSet}</dd>
              </div>
              <div className={styles.field}>
                <dt>{copy.business.industry}</dt>
                <dd>{profile.business.verticalName}</dd>
              </div>
              <div className={styles.field}>
                <dt>{copy.business.website}</dt>
                <dd>
                  {profile.business.websiteUrl ? (
                    <a href={profile.business.websiteUrl} target="_blank" rel="noreferrer" className={styles.link}>
                      {hostOf(profile.business.websiteUrl)}
                    </a>
                  ) : (
                    copy.business.noWebsite
                  )}
                </dd>
              </div>
            </dl>
            <ChipGroup label={copy.business.services} items={profile.business.services} empty={copy.business.noneYet} />
            <ChipGroup label={copy.business.segments} items={profile.business.segments} empty={copy.business.noneYet} />
            <Link href="/onboarding" className={styles.cardLink}>
              {copy.business.editServices}
              <ArrowRight aria-hidden size={14} />
            </Link>
          </section>
        </div>

        <div className={styles.column}>
          <section className={styles.card} aria-labelledby="locations-heading">
            <header className={styles.cardHead}>
              <h2 id="locations-heading" className={styles.cardTitle}>
                {copy.locations.heading}
              </h2>
              <Link href="/locations" className={styles.cardLink}>
                {copy.locations.manage}
              </Link>
            </header>
            <ul className={styles.rows}>
              {profile.locations.map((location) => (
                <li key={location.id} className={styles.row}>
                  <span className={styles.rowIcon} data-active={location.isActive} aria-hidden>
                    <MapPin size={16} />
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>{location.label}</span>
                    <span className={styles.rowSub}>{location.address ?? copy.locations.noAddress}</span>
                  </span>
                  {location.isActive && <span className={styles.activePill}>{copy.locations.active}</span>}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card} aria-labelledby="connections-heading">
            <header className={styles.cardHead}>
              <h2 id="connections-heading" className={styles.cardTitle}>
                {copy.connections.heading}
              </h2>
              <Link href="/onboarding" className={styles.cardLink}>
                {copy.connections.manage}
              </Link>
            </header>
            <ul className={styles.rows}>
              {profile.connections.map((connection) => (
                <li key={connection.provider} className={styles.row}>
                  <span className={styles.statusDot} data-status={connection.status} aria-hidden />
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>{copy.connections.labels[connection.provider]}</span>
                    {connection.accountLabel && <span className={styles.rowSub}>{connection.accountLabel}</span>}
                  </span>
                  <span className={styles.statusText} data-status={connection.status}>
                    {copy.connections.status[connection.status]}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.note}>{copy.simulatedNote}</p>
          </section>

          <section className={styles.card} aria-labelledby="preferences-heading">
            <header className={styles.cardHead}>
              <h2 id="preferences-heading" className={styles.cardTitle}>
                {copy.preferences.heading}
              </h2>
              <Link href="/settings" className={styles.cardLink}>
                {copy.preferences.manage}
              </Link>
            </header>
            <div className={styles.row}>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{copy.preferences.weeklyReport}</span>
              </span>
              <span className={styles.statusText} data-status={profile.weeklyReportOn ? "connected" : "disconnected"}>
                {profile.weeklyReportOn ? copy.preferences.on : copy.preferences.off}
              </span>
            </div>
            <form action={signOutAction} className={styles.signOutForm}>
              <button type="submit" className={styles.signOut}>
                <LogOut aria-hidden size={16} />
                {copy.signOut}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

/** A circular meter for how much of the profile is complete; the percentage is always printed inside it. */
function StrengthRing({ percent, label }: { percent: number; label: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={styles.ring} role="img" aria-label={label}>
      <svg viewBox="0 0 84 84" width="84" height="84" aria-hidden>
        <circle cx="42" cy="42" r={radius} className={styles.ringTrack} />
        <circle
          cx="42"
          cy="42"
          r={radius}
          className={styles.ringFill}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <span className={styles.ringValue}>{percent}%</span>
    </div>
  );
}

function ChipGroup({ label, items, empty }: { label: string; items: readonly string[]; empty: string }) {
  return (
    <div className={styles.chipGroup}>
      <p className={styles.chipLabel}>{label}</p>
      {items.length === 0 ? (
        <p className={styles.rowSub}>{empty}</p>
      ) : (
        <ul className={styles.chips}>
          {items.map((item) => (
            <li key={item} className={styles.chip}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditableField({
  label,
  value,
  copy,
  isEditable = true,
  onSave,
  onSaved,
}: {
  label: string;
  value: string;
  copy: ProfileCopy;
  isEditable?: boolean;
  onSave: (name: string) => Promise<ProfileResult>;
  onSaved: (profile: ProfileView) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();

  const save = () =>
    startSave(async () => {
      const result = await onSave(draft);
      if (result.profile) {
        onSaved(result.profile);
        setIsEditing(false);
        setError(null);
      } else setError(result.error);
    });

  return (
    <div className={styles.field}>
      <dt>{label}</dt>
      <dd>
        {isEditing ? (
          <form
            className={styles.editForm}
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <input
              className={styles.input}
              value={draft}
              autoFocus
              maxLength={160}
              aria-label={label}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setDraft(value);
                  setIsEditing(false);
                }
              }}
            />
            <button type="submit" className={styles.saveButton} disabled={isSaving}>
              {isSaving ? copy.edit.saving : copy.edit.save}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setDraft(value);
                setIsEditing(false);
                setError(null);
              }}
            >
              {copy.edit.cancel}
            </button>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
          </form>
        ) : (
          <span className={styles.valueRow}>
            {value}
            {isEditable && (
              <button
                type="button"
                className={styles.editButton}
                aria-label={`${copy.edit.edit} ${label.toLowerCase()}`}
                onClick={() => {
                  setDraft(value);
                  setIsEditing(true);
                }}
              >
                <Pencil aria-hidden size={14} />
              </button>
            )}
          </span>
        )}
      </dd>
    </div>
  );
}
