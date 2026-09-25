// Resources page opener.
import { Info } from "lucide-react";
import type { ResourcesCopy } from "@/frontend/copy/resources";
import styles from "./resources-hero.module.css";

export function ResourcesHero({ copy }: { copy: ResourcesCopy["hero"] }) {
  return (
    <section className={styles.section} aria-labelledby="resources-heading">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1 id="resources-heading" className={styles.heading}>
          {copy.headline}
        </h1>
        <p className={styles.lead}>{copy.lead}</p>
        <p className={styles.note}>
          <Info aria-hidden size={17} />
          {copy.note}
        </p>
      </div>
    </section>
  );
}
