// What a screen shows before its first scan has produced anything.
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function EmptyState({
  icon,
  heading,
  body,
  cta,
}: {
  icon?: ReactNode;
  heading: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className={styles.empty}>
      {icon && <span className={styles.emptyIcon}>{icon}</span>}
      <h2 className={styles.emptyHeading}>{heading}</h2>
      <p className={styles.emptyBody}>{body}</p>
      {cta && (
        <Link href={cta.href} className={styles.emptyCta}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}
