"use client";
// Tells a signed-in user that everything they see is simulated. Dismissing it lasts for the browser session:
// a session cookie, read by the layout on the server, so a dismissed banner never flashes back on navigation.
import { X } from "lucide-react";
import { useState } from "react";
import { SIMULATION_BANNER_COOKIE } from "@/shared/constants/simulation-banner";
import styles from "./simulation-banner.module.css";

type SimulationBannerProps = {
  copy: { title: string; body: string; dismiss: string };
};

export function SimulationBanner({ copy }: SimulationBannerProps) {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) return null;

  const dismiss = () => {
    // No max-age: the cookie, and so the dismissal, ends when the browser closes.
    document.cookie = `${SIMULATION_BANNER_COOKIE}=dismissed; path=/; samesite=lax`;
    setIsOpen(false);
  };

  return (
    <div className={styles.banner} role="status">
      <p className={styles.text}>
        <strong className={styles.title}>{copy.title}</strong> {copy.body}
      </p>
      <button type="button" className={styles.close} onClick={dismiss} aria-label={copy.dismiss}>
        <X aria-hidden size={18} />
      </button>
    </div>
  );
}
