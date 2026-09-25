// Dashboard route: reads precomputed scores and opportunities via services.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getDashboard } from "@/backend/services/dashboard-service";
import { listForOwner } from "@/backend/services/notification-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { DashboardView } from "@/frontend/components/dashboard/dashboard-view";
import { dashboardCopy } from "@/frontend/copy/dashboard";

export const metadata: Metadata = {
  title: "Home — REYNAV",
};

/** Resolved on the server and passed down, so the client never renders a different time than the server did. */
function greetingFor(hour: number, copy: ReturnType<typeof dashboardCopy>["greetings"]): string {
  if (hour < 12) return copy.morning;
  if (hour < 18) return copy.afternoon;
  return copy.evening;
}

export default async function DashboardPage() {
  const ctx = await requireTenant();
  const now = new Date();
  const [workspace, data, notifications] = await Promise.all([
    getWorkspace(ctx),
    getDashboard(ctx),
    listForOwner(ctx, now),
  ]);
  const copy = dashboardCopy(workspace.labels);

  const formattedDate = now.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <DashboardView
      initial={data}
      copy={copy}
      greeting={greetingFor(now.getHours(), copy.greetings)}
      formattedDate={formattedDate}
      notifications={notifications}
    />
  );
}
