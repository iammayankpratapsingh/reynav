// A titled white card. The building block the sections are laid out from.
import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function Panel({
  title,
  action,
  children,
  padded = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className={padded ? styles.panel : `${styles.panel} ${styles.panelFlush}`}>
      {(title || action) && (
        <div className={styles.panelHead}>
          {title && <h2 className={styles.panelTitle}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
