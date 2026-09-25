"use client";
// Which notifications this browser has read. A per-viewer convenience kept in local storage, shared by the
// bell and the full screen (and kept in step between tabs). Everything renders correctly without it.
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "reynav.notifications.read";

function load(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set();
  }
}

function save(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage can be unavailable (private windows, blocked site data); read state then lasts for this visit.
  }
}

export function useNotificationReads() {
  const [read, setRead] = useState<Set<string>>(new Set());
  // False until mounted: the server cannot see this browser's storage, so unread counts wait for the client.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setRead(load());
    setIsReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setRead(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((change: (next: Set<string>) => void) => {
    setRead((current) => {
      const next = new Set(current);
      change(next);
      save(next);
      return next;
    });
  }, []);

  const markRead = useCallback((ids: readonly string[]) => update((next) => ids.forEach((id) => next.add(id))), [update]);
  const markUnread = useCallback((id: string) => update((next) => next.delete(id)), [update]);

  return { read, isReady, markRead, markUnread };
}
