// Wide band for groups and franchises that outgrow the standard plans.
import Link from "next/link";
import { ArrowRight, Dot } from "lucide-react";
import type { PricingCopy } from "@/frontend/copy/pricing";
import styles from "./enterprise-band.module.css";

export function EnterpriseBand({ copy }: { copy: PricingCopy["enterprise"] }) {
  return (
    <section className={styles.section} aria-labelledby="enterprise-heading">
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="enterprise-heading" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{copy.body}</p>
        </div>
        <div className={styles.aside}>
          <ul className={styles.points}>
            {copy.points.map((point) => (
              <li key={point} className={styles.point}>
                <Dot aria-hidden size={20} />
                {point}
              </li>
            ))}
          </ul>
          <Link href={copy.cta.href} className={styles.cta}>
            {copy.cta.label}
            <ArrowRight aria-hidden size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
