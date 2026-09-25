// Growth Plan route: this month's four focus weeks with one task a day.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getPlan } from "@/backend/services/growth-plan-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { GrowthPlanBoard } from "@/frontend/components/growth-plan/growth-plan-board";
import { growthPlanCopy } from "@/frontend/copy/growth-plan";

export const metadata: Metadata = {
  title: "Growth Plan — REYNAV",
};

export default async function GrowthPlanPage() {
  const ctx = await requireTenant();
  const [workspace, plan] = await Promise.all([getWorkspace(ctx), getPlan(ctx)]);
  const today = new Date().toISOString().slice(0, 10);
  return <GrowthPlanBoard initial={plan} today={today} copy={growthPlanCopy(workspace.labels)} />;
}
