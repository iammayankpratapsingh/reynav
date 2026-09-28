// Authenticated shell: resolves tenant and vertical labels server-side for child pages.
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "@/backend/config";
import { getTenant } from "@/backend/services/auth/require-tenant";
import { listOptions } from "@/backend/services/location-service";
import { isOnboarded } from "@/backend/services/onboarding-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { AppSidebar } from "@/frontend/components/app/app-sidebar";
import { SimulationBanner } from "@/frontend/components/app/simulation-banner";
import { SIMULATION_BANNER_COOKIE } from "@/shared/constants/simulation-banner";
import { appShellCopy } from "@/frontend/copy/app-shell";
import { VerticalLabelsProvider } from "@/frontend/providers/vertical-labels-provider";
import styles from "./layout.module.css";

/** Starting a scan runs it after the response, in the same function; a full simulated scan takes ~25s. */
export const maxDuration = 60;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const ctx = await getTenant();
  if (!ctx) redirect("/login");
  if (!(await isOnboarded(ctx))) redirect("/onboarding");

  const [workspace, locations, cookieStore] = await Promise.all([getWorkspace(ctx), listOptions(ctx), cookies()]);
  const copy = appShellCopy();
  // Every figure comes from mock providers while this is on; say so until the user dismisses it.
  const showSimulationBanner = config.useMockData && !cookieStore.has(SIMULATION_BANNER_COOKIE);

  return (
    <VerticalLabelsProvider labels={workspace.labels}>
      <div className={styles.shell}>
        <AppSidebar
          copy={copy}
          account={{ organizationName: workspace.organizationName, locationLabel: workspace.locationLabel }}
          locations={locations}
        />
        <main className={styles.main}>
          {showSimulationBanner && <SimulationBanner copy={copy.simulation} />}
          {children}
        </main>
      </div>
    </VerticalLabelsProvider>
  );
}
