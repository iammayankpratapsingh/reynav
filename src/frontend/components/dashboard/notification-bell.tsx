"use client";
// The bell in Home's header: an unread badge, a gentle swing when something new is waiting, and a panel
// of recent notifications. Which ones were read is remembered in this browser only — a convenience, not
// a record — so the list always renders correctly without it.
import Link from "next/link";
import { Bell, Maximize2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  fill,
  NOTIFICATION_ICONS,
  notificationWords,
  relativeTime,
} from "@/frontend/components/notifications/notification-text";
import type { NotificationsCopy } from "@/frontend/copy/notifications";
import { useNotificationReads } from "@/frontend/hooks/use-notification-reads";
import type { AppNotification } from "@/shared/types/notification";
import styles from "./notification-bell.module.css";

type Copy = NotificationsCopy;

/** Where the full notifications screen lives. */
const FULL_SCREEN_HREF = "/notifications";

export function NotificationBell({ items, copy }: { items: readonly AppNotification[]; copy: Copy }) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const { read, isReady, markRead } = useNotificationReads();
  // The clock is read after mount so the server and browser render the same first frame.
  const [now, setNow] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setNow(Date.now()), []);

  const unread = isReady ? items.filter((item) => !read.has(item.id)).length : 0;

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const label = unread > 0 ? `${copy.button}, ${fill(copy.unread, { count: unread })}` : copy.button;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.bell}
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        data-unread={unread > 0}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell aria-hidden size={20} strokeWidth={2} className={styles.bellIcon} />
        {unread > 0 && (
          <span className={styles.badge} aria-hidden>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div id={panelId} role="dialog" aria-label={copy.heading} className={styles.panel}>
          <header className={styles.panelHead}>
            <p className={styles.panelTitle}>
              {copy.heading}
              {unread > 0 && <span className={styles.countPill}>{fill(copy.unread, { count: unread })}</span>}
            </p>
            <span className={styles.headActions}>
              {unread > 0 && (
                <button type="button" className={styles.markAll} onClick={() => markRead(items.map((item) => item.id))}>
                  {copy.markAll}
                </button>
              )}
              <Link
                href={FULL_SCREEN_HREF}
                className={styles.expand}
                aria-label={copy.expand}
                title={copy.expand}
                onClick={() => setIsOpen(false)}
              >
                <Maximize2 aria-hidden size={16} />
              </Link>
            </span>
          </header>

          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden>
                <Bell size={22} />
              </span>
              <p className={styles.emptyTitle}>{copy.empty}</p>
              <p className={styles.emptyNote}>{copy.emptyNote}</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => {
                const Icon = NOTIFICATION_ICONS[item.kind];
                const text = notificationWords(item, copy);
                const isUnread = !read.has(item.id);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={styles.item}
                      data-unread={isUnread}
                      onClick={() => {
                        markRead([item.id]);
                        setIsOpen(false);
                      }}
                    >
                      <span className={styles.itemIcon} data-kind={item.kind} aria-hidden>
                        <Icon size={17} />
                      </span>
                      <span className={styles.itemText}>
                        <span className={styles.itemTitle}>{text.title}</span>
                        <span className={styles.itemBody}>{text.body}</span>
                        {now !== null && (
                          <span className={styles.itemTime}>{relativeTime(item.at, now, copy.justNow)}</span>
                        )}
                      </span>
                      {isUnread && <span className={styles.dot} aria-label={copy.unreadLabel} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
