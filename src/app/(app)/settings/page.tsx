// Settings route: business details, connections, team, plan and data.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getWorkspace } from "@/backend/services/organization-service";
import { getSettings } from "@/backend/services/settings-service";
import { SettingsView } from "@/frontend/components/settings/settings-view";
import { settingsCopy } from "@/frontend/copy/settings";

export const metadata: Metadata = {
  title: "Settings — REYNAV",
};

export default async function SettingsPage() {
  const ctx = await requireTenant();
  const [workspace, view] = await Promise.all([getWorkspace(ctx), getSettings(ctx)]);
  return <SettingsView view={view} copy={settingsCopy(workspace.labels)} />;
}
