"use client";
// The visitor's cookie choices, kept in a first-party cookie so the banner asks once. Shared by the banner,
// the settings dialog and the footer's "Cookie settings" link through one small store.
import { useSyncExternalStore } from "react";

export type ConsentChoices = { functional: boolean };

type ConsentState = {
  /** False on the server and during hydration, where this browser's cookies are not known yet. */
  isReady: boolean;
  /** Null until the visitor has chosen. */
  choices: ConsentChoices | null;
  isSettingsOpen: boolean;
};

const COOKIE_NAME = "reynav_consent";
// Bump when the categories change so everyone is asked again.
const CONSENT_VERSION = 1;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

const SERVER_STATE: ConsentState = { isReady: false, choices: null, isSettingsOpen: false };
let state: ConsentState | null = null;
const listeners = new Set<() => void>();

function readCookie(): ConsentChoices | null {
  try {
    const raw = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${COOKIE_NAME}=`))
      ?.slice(COOKIE_NAME.length + 1);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return null;
    const { v, functional } = parsed as { v?: unknown; functional?: unknown };
    return v === CONSENT_VERSION && typeof functional === "boolean" ? { functional } : null;
  } catch {
    return null;
  }
}

function writeCookie(choices: ConsentChoices): void {
  const value = encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, ...choices, at: new Date().toISOString() }));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function getSnapshot(): ConsentState {
  state ??= { isReady: true, choices: readCookie(), isSettingsOpen: false };
  return state;
}

function getServerSnapshot(): ConsentState {
  return SERVER_STATE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(next: Partial<ConsentState>): void {
  state = { ...getSnapshot(), ...next };
  listeners.forEach((listener) => listener());
}

export function saveConsent(choices: ConsentChoices): void {
  const wasFunctional = getSnapshot().choices?.functional ?? false;
  writeCookie(choices);
  setState({ choices, isSettingsOpen: false });
  // A third-party script cannot be unloaded once running, so withdrawing consent reloads without it.
  if (wasFunctional && !choices.functional) window.location.reload();
}

export function openCookieSettings(): void {
  setState({ isSettingsOpen: true });
}

export function closeCookieSettings(): void {
  setState({ isSettingsOpen: false });
}

export function useCookieConsent(): ConsentState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
