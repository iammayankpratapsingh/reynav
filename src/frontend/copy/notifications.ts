// Product copy for notifications: the bell on Home and the full notifications screen.
import type { VerticalLabels } from "@/shared/types/vertical";

export function notificationsCopy(labels: VerticalLabels) {
  return {
    button: "Notifications",
    /** {count} is filled in on the client. */
    unread: "{count} unread",
    heading: "Notifications",
    markAll: "Mark all as read",
    empty: "You're all caught up.",
    emptyNote: "We'll let you know when a scan finishes or something needs you.",
    kinds: {
      scan: {
        title: "Your scan is complete",
        body: "Growth Score {score}/100.",
        bodyUp: "Growth Score {score}/100 — up {delta} since last scan.",
        bodyDown: "Growth Score {score}/100 — down {delta} since last scan.",
      },
      opportunity: {
        title: "Top opportunity: {title}",
        body: `Worth an estimated {low}–{high} extra ${labels.bookingPlural.toLowerCase()} a month.`,
      },
      plan: { title: "Today's growth task", body: "{task}" },
      reviews: {
        title: "{count} reviews waiting for a reply",
        titleOne: "1 review waiting for a reply",
        body: "Latest from {author}: “{text}”",
        bodyFallback: "Reply to keep your rating strong.",
      },
      competitor: {
        title: "{name} is pulling ahead",
        reviews: "{theirs} reviews in the last 30 days — you have {yours}.",
        posts: "{theirs} Google posts in 90 days — you have {yours}.",
        photos: "{theirs} photos on their profile — you have {yours}.",
      },
    },
    justNow: "Just now",
    unreadLabel: "Unread",
    expand: "Open full screen",
    page: {
      title: "Notifications",
      subtitle: "Everything that changed and everything that needs you, in one place.",
      filters: {
        all: "All",
        unread: "Unread",
        scan: "Scans",
        opportunity: "Opportunities",
        plan: "Growth plan",
        reviews: "Reviews",
        competitor: "Competitors",
      },
      filterLabel: "Filter notifications",
      open: "Open",
      markRead: "Mark as read",
      markUnread: "Mark as unread",
      noneInFilter: "Nothing here right now.",
      storageNote: "Read status is saved in this browser.",
    },
  } as const;
}

export type NotificationsCopy = ReturnType<typeof notificationsCopy>;
