"use client";
// Cookie banner and settings for the public pages. Nothing optional loads until the visitor agrees: the
// Chatbase chat bubble renders only with "functional" consent. Accept and Reject carry equal weight.
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { SiteCopy } from "@/frontend/copy/site";
import {
  closeCookieSettings,
  openCookieSettings,
  saveConsent,
  useCookieConsent,
  type ConsentChoices,
} from "@/frontend/hooks/use-cookie-consent";
import { ChatbaseWidget } from "./chatbase-widget";
import styles from "./cookie-consent.module.css";

type CookieCopy = SiteCopy["cookies"];

/** Lets the page settle before the banner asks for attention. */
const BANNER_DELAY_MS = 2000;

export function CookieConsent({ copy }: { copy: CookieCopy }) {
  const { isReady, choices, isSettingsOpen } = useCookieConsent();
  const [isDelayOver, setIsDelayOver] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsDelayOver(true), BANNER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {choices?.functional && <ChatbaseWidget />}
      {isReady && isDelayOver && !choices && !isSettingsOpen && <CookieBanner copy={copy.banner} />}
      {isSettingsOpen && <CookieSettings copy={copy.settings} current={choices} />}
    </>
  );
}

function CookieBanner({ copy }: { copy: CookieCopy["banner"] }) {
  return (
    <section className={styles.banner} aria-label={copy.label}>
      <div className={styles.bannerText}>
        <h2 className={styles.bannerHeading}>{copy.heading}</h2>
        <p className={styles.bannerBody}>{copy.body}</p>
      </div>
      <div className={styles.bannerActions}>
        <button type="button" className={styles.textButton} onClick={openCookieSettings}>
          {copy.manage}
        </button>
        <button type="button" className={styles.secondary} onClick={() => saveConsent({ functional: false })}>
          {copy.rejectAll}
        </button>
        <button type="button" className={styles.primary} onClick={() => saveConsent({ functional: true })}>
          {copy.acceptAll}
        </button>
      </div>
    </section>
  );
}

function CookieSettings({ copy, current }: { copy: CookieCopy["settings"]; current: ConsentChoices | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [functional, setFunctional] = useState(current?.functional ?? false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="cookie-settings-heading" onClose={closeCookieSettings}>
      <div className={styles.dialogHeader}>
        <h2 id="cookie-settings-heading" className={styles.dialogHeading}>
          {copy.heading}
        </h2>
        <button type="button" className={styles.close} aria-label={copy.close} onClick={() => dialogRef.current?.close()}>
          <X aria-hidden size={18} />
        </button>
      </div>
      <p className={styles.dialogIntro}>{copy.intro}</p>

      <ul className={styles.categories}>
        <li className={styles.category}>
          <div>
            <p className={styles.categoryTitle}>{copy.categories.necessary.title}</p>
            <p className={styles.categoryBody}>{copy.categories.necessary.body}</p>
          </div>
          <span className={styles.alwaysOn}>{copy.alwaysOn}</span>
        </li>
        <li className={styles.category}>
          <label htmlFor="cookie-functional">
            <span className={styles.categoryTitle}>{copy.categories.functional.title}</span>
            <span className={styles.categoryBody}>{copy.categories.functional.body}</span>
          </label>
          <input
            id="cookie-functional"
            type="checkbox"
            role="switch"
            className={styles.switch}
            checked={functional}
            onChange={(event) => setFunctional(event.target.checked)}
          />
        </li>
      </ul>

      <div className={styles.dialogActions}>
        <button type="button" className={styles.secondary} onClick={() => saveConsent({ functional: false })}>
          {copy.rejectAll}
        </button>
        <button type="button" className={styles.secondary} onClick={() => saveConsent({ functional })}>
          {copy.save}
        </button>
        <button type="button" className={styles.primary} onClick={() => saveConsent({ functional: true })}>
          {copy.acceptAll}
        </button>
      </div>
    </dialog>
  );
}
