// Preview of the first pieces in the library. Entries have no link yet, so they are not rendered as links.
import { Clock } from "lucide-react";
import type { ResourcesCopy } from "@/frontend/copy/resources";
import styles from "./resource-library.module.css";

export function ResourceLibrary({ copy }: { copy: ResourcesCopy["library"] }) {
  return (
    <section className={styles.section} aria-labelledby="library-heading">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="library-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.lead}>{copy.intro}</p>
      </div>

      <ul className={styles.list}>
        {copy.items.map((item, index) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <div className={styles.body}>
              <p className={styles.kind}>{item.kind}</p>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.summary}>{item.summary}</p>
            </div>
            <p className={styles.readTime}>
              <Clock aria-hidden size={15} />
              {item.readTime} {copy.readTimeLabel}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
