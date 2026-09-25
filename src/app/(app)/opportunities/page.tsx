// Opportunities route: the ranked list from the latest completed scan.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getBoard } from "@/backend/services/opportunity-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { OpportunityBoard } from "@/frontend/components/opportunities/opportunity-board";
import { opportunitiesCopy } from "@/frontend/copy/opportunities";

export const metadata: Metadata = {
  title: "Opportunities — REYNAV",
};

export default async function OpportunitiesPage() {
  const ctx = await requireTenant();
  const [workspace, board] = await Promise.all([getWorkspace(ctx), getBoard(ctx)]);
  return <OpportunityBoard board={board} copy={opportunitiesCopy(workspace.labels).list} />;
}
