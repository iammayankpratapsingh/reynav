"use client";
// The full notifications screen: filters across the top, then each notification as a card with its whole
// message, when it happened, and controls to open it or mark it read or unread.
import Link from "next/link";
import { ArrowRight, Bell, Check, CircleDot } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/frontend/components/app/page-header";
import type { NotificationsCopy } from "@/frontend/copy/notifications";
import { useNotificationReads } from "@/frontend/hooks/use-notification-reads";
import type { AppNotification, NotificationKind } from "@/shared/types/notification";
import { fill, NOTIFICATION_ICONS, notificationWords, relativeTime } from "./notification-text";
import styles from "./notification-center.module.css";

type Filter = "all" | "unread" | NotificationKind;

const FILTERS: readonly Filter[] = ["all", "unread", "scan", "opportunity", "plan", "reviews", "competitor"];
/** The full screen has room for the whole review quote. */
const FULL_PREVIEW = 400;

export function NotificationCenter({ items, copy }: { items: readonly AppNotification[]; copy: NotificationsCopy }) {
  const { read, isReady, markRead, markUnread } = useNotificationReads();
  const [filter, setFilter] = useState<Filter>("all");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const isUnread = (item: AppNotification) => isReady && !read.has(item.id);
  const unreadCount = items.filter(isUnread).length;

  const counts = useMemo(() => {
    const byFilter = new Map<Filter, number>([["all", items.length]]);
    byFilter.set("unread", isReady ? items.filter((item) => !read.has(item.id)).length : 0);
    for (const item of items) byFilter.set(item.kind, (byFilter.get(item.kind) ?? 0) + 1);
    return byFilter;
  }, [items, read, isReady]);

  const visible = items.filter((item) =>
    filter === "all" ? true : filter === "unread" ? isUnread(item) : item.kind === filter,
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.page.title}
        subtitle={copy.page.subtitle}
        action={
          unreadCount > 0 ? (
            <button type="button" className={styles.markAll} onClick={() => markRead(items.map((item) => item.id))}>
              <Check aria-hidden size={16} />
              {copy.markAll}
            </button>
          ) : undefined
        }
      />

      <div className={styles.filters} role="group" aria-label={copy.page.filterLabel}>
        {FILTERS.filter((key) => key === "all" || key === "unread" || (counts.get(key) ?? 0) > 0).map((key) => (
          <button
            key={key}
            type="button"
            className={styles.filter}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {copy.page.filters[key]}
            <span className={styles.filterCount}>{counts.get(key) ?? 0}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden>
            <Bell size={26} />
          </span>
          <p className={styles.emptyTitle}>{copy.empty}</p>
          <p className={styles.emptyNote}>{copy.emptyNote}</p>
        </div>
      ) : visible.length === 0 ? (
        <p className={styles.none}>{copy.page.noneInFilter}</p>
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => {
            const Icon = NOTIFICATION_ICONS[item.kind];
            const text = notificationWords(item, copy, FULL_PREVIEW);
            const unread = isUnread(item);
            return (
              <li key={item.id} className={styles.card} data-unread={unread}>
                <span className={styles.icon} data-kind={item.kind} aria-hidden>
                  <Icon size={20} />
                </span>
                <div className={styles.body}>
                  <p className={styles.meta}>
                    <span className={styles.kind}>{copy.page.filters[item.kind]}</span>
                    {now !== null && <span>{relativeTime(item.at, now, copy.justNow)}</span>}
                    {unread && (
                      <span className={styles.unread}>
                        <CircleDot aria-hidden size={12} />
                        {copy.unreadLabel}
                      </span>
                    )}
                  </p>
                  <h2 className={styles.title}>{text.title}</h2>
                  <p className={styles.text}>{text.body}</p>
                  <div className={styles.actions}>
                    <Link href={item.href} className={styles.open} onClick={() => markRead([item.id])}>
                      {copy.page.open}
                      <ArrowRight aria-hidden size={15} />
                    </Link>
                    <button
                      type="button"
                      className={styles.toggle}
                      onClick={() => (unread ? markRead([item.id]) : markUnread(item.id))}
                    >
                      {unread ? copy.page.markRead : copy.page.markUnread}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className={styles.note}>
        {unreadCount > 0 ? `${fill(copy.unread, { count: unreadCount })} · ` : ""}
        {copy.page.storageNote}
      </p>
    </div>
  );
}
