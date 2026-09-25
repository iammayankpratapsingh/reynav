// A generated thumbnail. The product ships no stock photography, so a piece of content is represented by a
// tinted gradient with its initials — deterministic, so the same item always looks the same.
import styles from "./ui.module.css";

const THEMES = ["rose", "blush", "amber", "violet", "teal", "sky"] as const;

export type ThumbTheme = (typeof THEMES)[number];

function initials(label: string): string {
  return label
    .split(/\s+/)
    .filter((word) => /[a-z]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** Picks a stable theme when the caller has none to give. */
function themeFor(label: string): ThumbTheme {
  let hash = 0;
  for (const character of label) hash = (hash * 31 + character.charCodeAt(0)) % 997;
  return THEMES[hash % THEMES.length]!;
}

export function Thumb({ label, theme, size = "md" }: { label: string; theme?: string; size?: "sm" | "md" }) {
  const resolved = THEMES.includes(theme as ThumbTheme) ? (theme as ThumbTheme) : themeFor(label);
  return (
    <span className={styles.thumb} data-theme={resolved} data-size={size} aria-hidden>
      {initials(label)}
    </span>
  );
}
