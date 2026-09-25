// Invites the reader to get new resources by email through their REYNAV account.
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ResourcesCopy } from "@/frontend/copy/resources";
import styles from "./notify-band.module.css";

export function NotifyBand({ copy }: { copy: ResourcesCopy["notify"] }) {
  return (
    <section className={styles.section} aria-labelledby="notify-heading">
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="notify-heading" className={styles.heading}>
            {copy.heading}
          </h2>
          <p className={styles.body}>{copy.body}</p>
        </div>
        <div className={styles.aside}>
          <ul className={styles.points}>
            {copy.points.map((point) => (
              <li key={point} className={styles.point}>
                <Check aria-hidden size={17} />
                <span>{point}</span>
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
