"use client";
// A removable list of tags with an inline "+ Add" field. Used for detected services and customer segments.
import { Plus, X } from "lucide-react";
import { useId, useState } from "react";
import styles from "./onboarding-wizard.module.css";

type ChipEditorProps = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  copy: { add: string; addPlaceholder: string; remove: string };
};

export function ChipEditor({ label, items, onChange, copy }: ChipEditorProps) {
  const labelId = useId();
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim().replace(/\s+/g, " ");
    if (value && !items.some((item) => item.toLowerCase() === value.toLowerCase())) onChange([...items, value]);
    setDraft("");
  };

  return (
    <div className={styles.chipGroup} role="group" aria-labelledby={labelId}>
      <p id={labelId} className={styles.sectionLabel}>
        {label}
      </p>
      <ul className={styles.chips}>
        {items.map((item) => (
          <li key={item} className={styles.chip}>
            <span>{item}</span>
            <button
              type="button"
              className={styles.chipRemove}
              aria-label={copy.remove.replace("{name}", item)}
              onClick={() => onChange(items.filter((existing) => existing !== item))}
            >
              <X aria-hidden size={13} strokeWidth={2.5} />
            </button>
          </li>
        ))}
        <li>
          {isAdding ? (
            <input
              className={styles.chipInput}
              value={draft}
              maxLength={60}
              placeholder={copy.addPlaceholder}
              aria-label={`${copy.add} — ${label}`}
              autoFocus
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit();
                } else if (event.key === "Escape") {
                  setDraft("");
                  setIsAdding(false);
                }
              }}
              onBlur={() => {
                commit();
                setIsAdding(false);
              }}
            />
          ) : (
            <button type="button" className={styles.chipAdd} onClick={() => setIsAdding(true)}>
              <Plus aria-hidden size={13} strokeWidth={2.5} />
              {copy.add}
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
