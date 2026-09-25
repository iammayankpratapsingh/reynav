// Words, icons and times for a notification. Shared by the bell on Home and the full notifications screen.
import { Bell, CalendarCheck, MessageSquare, Sparkles, TrendingUp, Users } from "lucide-react";
import type { NotificationsCopy } from "@/frontend/copy/notifications";
import type { AppNotification, NotificationKind } from "@/shared/types/notification";

export const NOTIFICATION_ICONS: Record<NotificationKind, typeof Bell> = {
  scan: TrendingUp,
  opportunity: Sparkles,
  plan: CalendarCheck,
  reviews: MessageSquare,
  competitor: Users,
};

const TEXT_PREVIEW = 90;

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function notificationWords(
  item: AppNotification,
  copy: NotificationsCopy,
  preview = TEXT_PREVIEW,
): { title: string; body: string } {
  const kinds = copy.kinds;
  switch (item.kind) {
    case "scan":
      return {
        title: kinds.scan.title,
        body:
          item.delta === null
            ? fill(kinds.scan.body, { score: item.score })
            : fill(item.delta >= 0 ? kinds.scan.bodyUp : kinds.scan.bodyDown, {
                score: item.score,
                delta: Math.abs(item.delta),
              }),
      };
    case "opportunity":
      return {
        title: fill(kinds.opportunity.title, { title: item.title }),
        body: fill(kinds.opportunity.body, { low: item.low, high: item.high }),
      };
    case "plan":
      return { title: kinds.plan.title, body: fill(kinds.plan.body, { task: item.task }) };
    case "reviews": {
      const text = item.latestText ?? "";
      return {
        title: item.count === 1 ? kinds.reviews.titleOne : fill(kinds.reviews.title, { count: item.count }),
        body:
          item.latestAuthor && item.latestText
            ? fill(kinds.reviews.body, {
                author: item.latestAuthor,
                text: text.length > preview ? `${text.slice(0, preview)}…` : text,
              })
            : kinds.reviews.bodyFallback,
      };
    }
    case "competitor":
      return {
        title: fill(kinds.competitor.title, { name: item.name }),
        body: fill(kinds.competitor[item.metric], { theirs: item.theirs, yours: item.yours }),
      };
  }
}

export function relativeTime(iso: string, now: number, justNow: string): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (Math.abs(seconds) < 60) return justNow;
  const format = new Intl.RelativeTimeFormat("en-CA", { numeric: "auto", style: "short" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return justNow;
}
