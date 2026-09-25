"use client";
// Tab strip used by the screens that split their content by channel or view.
import styles from "./ui.module.css";

export type Tab = { id: string; label: string };

export function TabNav({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: readonly Tab[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`panel-${tab.id}`}
          className={styles.tab}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
