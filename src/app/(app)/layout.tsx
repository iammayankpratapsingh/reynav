// Authenticated shell: resolves tenant and vertical labels server-side for child pages.
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTenant } from "@/backend/services/auth/require-tenant";
import { listOptions } from "@/backend/services/location-service";
import { isOnboarded } from "@/backend/services/onboarding-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { AppSidebar } from "@/frontend/components/app/app-sidebar";
import { appShellCopy } from "@/frontend/copy/app-shell";
import { VerticalLabelsProvider } from "@/frontend/providers/vertical-labels-provider";
import styles from "./layout.module.css";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const ctx = await getTenant();
  if (!ctx) redirect("/login");
  if (!(await isOnboarded(ctx))) redirect("/onboarding");

  const [workspace, locations] = await Promise.all([getWorkspace(ctx), listOptions(ctx)]);
  const copy = appShellCopy();

  return (
    <VerticalLabelsProvider labels={workspace.labels}>
      <div className={styles.shell}>
        <AppSidebar
          copy={copy}
          account={{ organizationName: workspace.organizationName, locationLabel: workspace.locationLabel }}
          locations={locations}
        />
        <main className={styles.main}>{children}</main>
      </div>
    </VerticalLabelsProvider>
  );
}
