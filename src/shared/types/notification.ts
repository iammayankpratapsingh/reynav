// Notifications under the bell on Home: short, linkable, and built from what the scans already stored.
// The service supplies facts; the UI words them from the copy file.

export type AppNotification = { id: string; href: string; at: string } & (
  | { kind: "scan"; score: number; delta: number | null }
  | { kind: "opportunity"; title: string; low: number; high: number }
  | { kind: "plan"; task: string }
  | { kind: "reviews"; count: number; latestAuthor: string | null; latestText: string | null }
  | { kind: "competitor"; name: string; metric: "reviews" | "posts" | "photos"; theirs: number; yours: number }
);

export type NotificationKind = AppNotification["kind"];
