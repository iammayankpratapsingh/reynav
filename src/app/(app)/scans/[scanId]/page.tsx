// Scan progress route: shows scan_steps status for one scan.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, CircleDashed, LoaderCircle, X } from "lucide-react";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getScanView } from "@/backend/services/dashboard-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { dashboardCopy } from "@/frontend/copy/dashboard";
import { isAppError } from "@/shared/errors";
import type { ScanStepStatus } from "@/shared/constants/scan-steps";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Scan — REYNAV",
};

const icons = { waiting: CircleDashed, running: LoaderCircle, done: Check, failed: X };

export default async function ScanPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const ctx = await requireTenant();

  const [workspace, view] = await Promise.all([
    getWorkspace(ctx),
    getScanView(ctx, scanId).catch((error: unknown) => {
      if (isAppError(error) && error.code === "not_found") return null;
      throw error;
    }),
  ]);
  if (!view || !view.scan) notFound();

  const copy = dashboardCopy(workspace.labels);

  return (
    <section className={styles.card}>
      <p className={styles.status} data-status={view.scan.status}>
        {view.scan.status} · {view.scan.percentComplete}%
      </p>
      <h1 className={styles.heading}>Scan progress</h1>

      <ol className={styles.steps}>
        {view.scan.steps.map((step) => {
          const Icon = icons[step.status as ScanStepStatus];
          return (
            <li key={step.step} className={styles.step} data-status={step.status}>
              <span className={styles.icon}>
                <Icon aria-hidden size={16} className={step.status === "running" ? styles.spinner : undefined} />
              </span>
              <span className={styles.stepLabel}>{copy.steps[step.step]}</span>
              <span className={styles.stepStatus}>{step.status}</span>
            </li>
          );
        })}
      </ol>

      <p className={styles.meta}>Scan {view.scan.scanId}</p>
      <Link href="/dashboard" className={styles.link}>
        Back to home
      </Link>
    </section>
  );
}
