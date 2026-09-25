// A single figure with its label. Used for the stat rows across the sections.
import type { ReactNode } from "react";
import styles from "./ui.module.css";

export type StatTone = "plain" | "brand" | "positive" | "warning";

export function StatTile({
  value,
  label,
  tone = "plain",
  icon,
  hint,
}: {
  value: string;
  label: string;
  tone?: StatTone;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className={styles.stat} data-tone={tone}>
      {icon && <span className={styles.statIcon}>{icon}</span>}
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
      {hint && <p className={styles.statHint}>{hint}</p>}
    </div>
  );
}
