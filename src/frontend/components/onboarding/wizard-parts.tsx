"use client";
// Pieces every wizard step shares: the heading block, the Back / Skip / Continue footer, and a spinner.
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./onboarding-wizard.module.css";

export function StepHeading({ id, title, intro }: { id: string; title: string; intro: string }) {
  return (
    <div className={styles.stepHeading}>
      <h1 id={id} className={styles.heading}>
        {title}
      </h1>
      <p className={styles.intro}>{intro}</p>
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <LoaderCircle aria-hidden size={size} className={styles.spinner} />;
}

type FooterProps = {
  back: { label: string; onClick?: () => void; href?: string };
  skip?: { label: string; onClick: () => void; disabled?: boolean };
  primary: { label: string; onClick: () => void; disabled?: boolean; isBusy?: boolean };
  hint?: ReactNode;
};

export function WizardFooter({ back, skip, primary, hint }: FooterProps) {
  return (
    <footer className={styles.footer}>
      {back.href ? (
        <Link href={back.href} className={styles.secondaryButton}>
          {back.label}
        </Link>
      ) : (
        <button type="button" className={styles.secondaryButton} onClick={back.onClick}>
          {back.label}
        </button>
      )}

      <div className={styles.footerEnd}>
        {hint && <p className={styles.footerHint}>{hint}</p>}
        {skip && (
          <button type="button" className={styles.textButton} onClick={skip.onClick} disabled={skip.disabled}>
            {skip.label}
          </button>
        )}
        <button
          type="button"
          className={styles.primaryButton}
          onClick={primary.onClick}
          disabled={primary.disabled || primary.isBusy}
        >
          {primary.isBusy && <Spinner />}
          {primary.label}
        </button>
      </div>
    </footer>
  );
}
