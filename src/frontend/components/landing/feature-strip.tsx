// Landing feature strip: the sources REYNAV connects and the outcome it drives.
import { BriefcaseBusiness, FileText, House, MapPin, Users, type LucideIcon } from "lucide-react";
import type { HomeCopy } from "@/frontend/copy/home";
import styles from "./feature-strip.module.css";

type FeatureId = HomeCopy["features"]["items"][number]["id"];

const icons: Record<FeatureId, { Icon: LucideIcon; tone: string }> = {
  listing: { Icon: House, tone: styles.blue },
  website: { Icon: FileText, tone: styles.purple },
  booking: { Icon: BriefcaseBusiness, tone: styles.green },
  ai: { Icon: MapPin, tone: styles.pink },
  customers: { Icon: Users, tone: styles.orange },
};

export function FeatureStrip({ copy }: { copy: HomeCopy["features"] }) {
  return (
    <section className={styles.strip} aria-label={copy.heading}>
      <ul className={styles.list}>
        {copy.items.map((item) => {
          const { Icon, tone } = icons[item.id];
          return (
            <li key={item.id} className={styles.item}>
              <span className={`${styles.tile} ${tone}`}>
                <Icon aria-hidden size={40} strokeWidth={2.25} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
