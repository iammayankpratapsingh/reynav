// The four kinds of resource REYNAV publishes, each with its status.
import { BookOpen, ChartNoAxesColumn, LifeBuoy, Map, type LucideIcon } from "lucide-react";
import type { ResourcesCopy } from "@/frontend/copy/resources";
import styles from "./resource-categories.module.css";

type Categories = ResourcesCopy["categories"];
type IconId = Categories["items"][number]["icon"];

const icons: Record<IconId, LucideIcon> = {
  guide: BookOpen,
  playbook: Map,
  benchmark: ChartNoAxesColumn,
  help: LifeBuoy,
};

export function ResourceCategories({ copy }: { copy: Categories }) {
  return (
    <section className={styles.section} aria-labelledby="categories-heading">
      <div className={styles.intro}>
        <h2 id="categories-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.lead}>{copy.intro}</p>
      </div>

      <ul className={styles.grid}>
        {copy.items.map((item) => {
          const Icon = icons[item.icon];
          return (
            <li key={item.id} className={styles.card}>
              <span className={styles.iconWrap}>
                <Icon aria-hidden size={22} />
              </span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.summary}>{item.summary}</p>
              <p className={styles.footerRow}>
                <span className={styles.meta}>{item.meta}</span>
                <span className={styles.status}>{copy.status[item.status]}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
