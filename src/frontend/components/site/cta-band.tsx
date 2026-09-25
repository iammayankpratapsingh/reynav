// Dark call-to-action band that closes a public marketing page.
import Link from "next/link";
import { CirclePlay } from "lucide-react";
import type { CtaBandCopy } from "@/shared/types/marketing";
import styles from "./cta-band.module.css";

export function CtaBand({ copy }: { copy: CtaBandCopy }) {
  return (
    <section className={styles.band} aria-labelledby="cta-band-heading">
      <div className={styles.inner}>
        <h2 id="cta-band-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.body}>{copy.body}</p>
        <div className={styles.actions}>
          <Link href={copy.primaryCta.href} className={styles.primary}>
            {copy.primaryCta.label}
          </Link>
          <a href={copy.secondaryCta.href} className={styles.secondary}>
            <CirclePlay aria-hidden size={20} />
            {copy.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
