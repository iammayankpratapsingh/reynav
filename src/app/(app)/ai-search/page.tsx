// AI Search route: whether AI answers name the business, by service and location, over time.
import type { Metadata } from "next";
import { getBoard } from "@/backend/services/ai-search-service";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getWorkspace } from "@/backend/services/organization-service";
import { AiSearchBoard } from "@/frontend/components/ai-search/ai-search-board";
import { aiSearchCopy } from "@/frontend/copy/ai-search";

export const metadata: Metadata = {
  title: "AI Search — REYNAV",
};

export default async function AiSearchPage() {
  const ctx = await requireTenant();
  const [workspace, board] = await Promise.all([getWorkspace(ctx), getBoard(ctx)]);
  return <AiSearchBoard board={board} copy={aiSearchCopy(workspace.labels)} />;
}
