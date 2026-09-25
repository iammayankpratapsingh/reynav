"use client";
// Full-screen welcome loader shown for a moment after a successful sign-in: the wordmark rises in letter by
// letter with a brand gradient that shines across it and a sparkle on its first letter, over a status line
// that moves through a few messages and a bar that fills over the same time the redirect waits.
import { useEffect, useState, type CSSProperties } from "react";
import styles from "./sign-in-loader.module.css";

type SignInLoaderProps = {
  copy: { label: string; messages: readonly string[] };
  durationMs: number;
};

const BRAND = "REYNAV";
// A four-point star on a 24-unit grid, the same sparkle as the footer wordmark.
const STAR_PATH = "M12 0C12.6 6.5 17.5 11.4 24 12C17.5 12.6 12.6 17.5 12 24C11.4 17.5 6.5 12.6 0 12C6.5 11.4 11.4 6.5 12 0Z";

export function SignInLoader({ copy, durationMs }: SignInLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const step = durationMs / copy.messages.length;

  useEffect(() => {
    const timer = setInterval(
      () => setMessageIndex((index) => Math.min(index + 1, copy.messages.length - 1)),
      step,
    );
    return () => clearInterval(timer);
  }, [step, copy.messages.length]);

  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label={copy.label}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.content}>
        <p className={styles.brand} aria-hidden>
          {[...BRAND].map((letter, index) => (
            <span key={index} className={styles.letter} style={{ "--i": index } as CSSProperties}>
              {letter}
            </span>
          ))}
          <svg viewBox="0 0 24 24" className={styles.sparkle} data-kind="main">
            <path d={STAR_PATH} />
          </svg>
          <svg viewBox="0 0 24 24" className={styles.sparkle} data-kind="small">
            <path d={STAR_PATH} />
          </svg>
        </p>

        <p key={messageIndex} className={styles.message}>
          {copy.messages[messageIndex]}
        </p>

        <span className={styles.bar} aria-hidden>
          <span className={styles.barFill} style={{ animationDuration: `${durationMs}ms` }} />
        </span>
      </div>
    </div>
  );
}
