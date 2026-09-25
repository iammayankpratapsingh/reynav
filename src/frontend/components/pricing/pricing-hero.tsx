// Pricing page opener: eyebrow, headline, lead and trust badges.
import { Check } from "lucide-react";
import type { PricingCopy } from "@/frontend/copy/pricing";
import styles from "./pricing-hero.module.css";

export function PricingHero({ copy }: { copy: PricingCopy["hero"] }) {
  return (
    <section className={styles.section} aria-labelledby="pricing-heading">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1 id="pricing-heading" className={styles.heading}>
          {copy.headline}
        </h1>
        <p className={styles.lead}>{copy.lead}</p>
        <ul className={styles.badges}>
          {copy.badges.map((badge) => (
            <li key={badge} className={styles.badge}>
              <Check aria-hidden size={16} />
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
