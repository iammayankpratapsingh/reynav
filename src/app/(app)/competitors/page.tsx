// Competitors route: nearby rivals from the latest scan, compared with the business.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getBoard } from "@/backend/services/competitor-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { CompetitorBoard } from "@/frontend/components/competitors/competitor-board";
import { competitorsCopy } from "@/frontend/copy/competitors";

export const metadata: Metadata = {
  title: "Competitors — REYNAV",
};

export default async function CompetitorsPage() {
  const ctx = await requireTenant();
  const [workspace, board] = await Promise.all([getWorkspace(ctx), getBoard(ctx)]);
  return <CompetitorBoard board={board} copy={competitorsCopy(workspace.labels)} />;
}
