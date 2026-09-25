"use client";
// Oversized brand wordmark closing the footer. The first time it scrolls into view, a small cluster of
// sparkles twinkles at the top-left of the first letter and fades away. Decorative only.
import { useEffect, useRef, useState } from "react";
import styles from "./footer-wordmark.module.css";

// A four-point star on a 24-unit grid.
const STAR_PATH = "M12 0C12.6 6.5 17.5 11.4 24 12C17.5 12.6 12.6 17.5 12 24C11.4 17.5 6.5 12.6 0 12C6.5 11.4 11.4 6.5 12 0Z";
const SPARKLES = ["main", "small", "tiny"] as const;

export function FooterWordmark({ brand }: { brand: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isSparkling, setIsSparkling] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsSparkling(true);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className={styles.wordmark} aria-hidden>
      <span className={styles.word}>
        <span className={styles.text}>{brand}</span>
        {isSparkling &&
          SPARKLES.map((kind) => (
            <svg key={kind} viewBox="0 0 24 24" className={styles.sparkle} data-kind={kind}>
              <path d={STAR_PATH} />
            </svg>
          ))}
      </span>
    </p>
  );
}
