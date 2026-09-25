// Reviews route: reputation summary, per-service breakdown and the feed.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getWorkspace } from "@/backend/services/organization-service";
import { getBoard } from "@/backend/services/review-service";
import { ReviewBoard } from "@/frontend/components/reviews/review-board";
import { reviewsCopy } from "@/frontend/copy/reviews";

export const metadata: Metadata = {
  title: "Reviews — REYNAV",
};

export default async function ReviewsPage() {
  const ctx = await requireTenant();
  const [workspace, board] = await Promise.all([getWorkspace(ctx), getBoard(ctx)]);
  return <ReviewBoard board={board} copy={reviewsCopy(workspace.labels)} />;
}
