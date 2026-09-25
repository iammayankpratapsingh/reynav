// Status indicator that uses text and icon, never colour alone.
import { AlertTriangle, Check, CircleDashed, LoaderCircle, X, type LucideIcon } from "lucide-react";
import styles from "./status-badge.module.css";

export type StatusTone = "idle" | "pending" | "success" | "warning" | "danger";

const icons: Record<StatusTone, LucideIcon> = {
  idle: CircleDashed,
  pending: LoaderCircle,
  success: Check,
  warning: AlertTriangle,
  danger: X,
};

export function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  const Icon = icons[tone];
  return (
    <span className={`${styles.badge} ${styles[tone]}`} data-tone={tone}>
      <Icon aria-hidden size={14} className={tone === "pending" ? styles.spin : undefined} />
      {label}
    </span>
  );
}
