// Reports route: one summary per completed scan.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getWorkspace } from "@/backend/services/organization-service";
import { getBoard } from "@/backend/services/report-service";
import { ReportBoard } from "@/frontend/components/reports/report-board";
import { reportsCopy } from "@/frontend/copy/reports";

export const metadata: Metadata = {
  title: "Reports — REYNAV",
};

export default async function ReportsPage() {
  const ctx = await requireTenant();
  const [workspace, board] = await Promise.all([getWorkspace(ctx), getBoard(ctx)]);
  return <ReportBoard board={board} copy={reportsCopy(workspace.labels)} />;
}
