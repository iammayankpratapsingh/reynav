// Campaigns route: what REYNAV suggests running next.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getBoard } from "@/backend/services/campaign-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { CampaignBoard } from "@/frontend/components/campaigns/campaign-board";
import { campaignsCopy } from "@/frontend/copy/campaigns";

export const metadata: Metadata = {
  title: "Campaigns — REYNAV",
};

export default async function CampaignsPage() {
  const ctx = await requireTenant();
  const [workspace, board] = await Promise.all([getWorkspace(ctx), getBoard(ctx)]);
  return <CampaignBoard board={board} copy={campaignsCopy(workspace.labels)} />;
}
