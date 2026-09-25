// Notifications route: every notification in full, with filters and read controls.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { listForOwner } from "@/backend/services/notification-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { NotificationCenter } from "@/frontend/components/notifications/notification-center";
import { notificationsCopy } from "@/frontend/copy/notifications";

export const metadata: Metadata = {
  title: "Notifications — REYNAV",
};

export default async function NotificationsPage() {
  const ctx = await requireTenant();
  const [workspace, items] = await Promise.all([getWorkspace(ctx), listForOwner(ctx, new Date())]);
  return <NotificationCenter items={items} copy={notificationsCopy(workspace.labels)} />;
}
