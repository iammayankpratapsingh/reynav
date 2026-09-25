"use client";
// The weekly report email: on or off, who gets it, when it goes next, and a button to send one now.
import { useState, useTransition } from "react";
import { saveReportPreferencesAction, sendReportNowAction } from "@/app/(app)/settings/actions";
import type { SettingsCopy } from "@/frontend/copy/settings";
import type { ReportPreferences } from "@/shared/types/settings";
import data from "@/frontend/components/app/data.module.css";
import styles from "./settings-view.module.css";

type Props = {
  copy: SettingsCopy["reports"];
  initial: ReportPreferences;
  canManage: boolean;
  isEmailSimulated: boolean;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WeeklyReportSettings({ copy, initial, canManage, isEmailSimulated }: Props) {
  const [preferences, setPreferences] = useState(initial);
  const [recipients, setRecipients] = useState(initial.recipients.join(", "));
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isBusy, startTransition] = useTransition();

  const parseRecipients = () =>
    recipients
      .split(/[,\s]+/)
      .map((email) => email.trim())
      .filter(Boolean);

  const save = (weeklyEnabled: boolean) =>
    startTransition(async () => {
      const result = await saveReportPreferencesAction({ weeklyEnabled, recipients: parseRecipients() });
      if (result.preferences) {
        setPreferences(result.preferences);
        setMessage({ tone: "ok", text: copy.saved });
      } else setMessage({ tone: "error", text: result.error });
    });

  const sendNow = () =>
    startTransition(async () => {
      const result = await sendReportNowAction();
      if (result.preferences) {
        setPreferences(result.preferences);
        setMessage({ tone: "ok", text: isEmailSimulated ? copy.sentSimulated : copy.sent });
      } else setMessage({ tone: "error", text: result.error });
    });

  return (
    <div className={styles.reportSettings}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={preferences.weeklyEnabled}
          disabled={!canManage || isBusy}
          onChange={(event) => save(event.target.checked)}
        />
        <span>{copy.toggle}</span>
      </label>

      <label className={styles.inviteField}>
        <span>{copy.recipientsLabel}</span>
        <input
          className={data.input}
          value={recipients}
          disabled={!canManage || isBusy}
          onChange={(event) => setRecipients(event.target.value)}
          onBlur={() => save(preferences.weeklyEnabled)}
        />
      </label>
      <p className={data.note}>{copy.recipientsHelp}</p>

      <dl className={styles.reportFacts}>
        <div>
          <dt>{copy.nextLabel}</dt>
          <dd>{preferences.nextSendAt ? formatWhen(preferences.nextSendAt) : copy.off}</dd>
        </div>
        <div>
          <dt>{copy.lastLabel}</dt>
          <dd>{preferences.lastSentAt ? formatWhen(preferences.lastSentAt) : copy.never}</dd>
        </div>
      </dl>

      {canManage && (
        <button type="button" className={data.button} onClick={sendNow} disabled={isBusy}>
          {isBusy ? copy.sending : copy.sendNow}
        </button>
      )}
      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={message.tone === "error" ? styles.formError : styles.formSuccess}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
