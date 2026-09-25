// Services route: every service with demand, competition, the owner's economics and a live score.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getWorkspace } from "@/backend/services/organization-service";
import { getBoard } from "@/backend/services/service-intelligence-service";
import { ServiceBoard } from "@/frontend/components/services/service-board";
import { servicesCopy } from "@/frontend/copy/services";

export const metadata: Metadata = {
  title: "Services — REYNAV",
};

export default async function ServicesPage() {
  const ctx = await requireTenant();
  const [workspace, board] = await Promise.all([getWorkspace(ctx), getBoard(ctx)]);
  return <ServiceBoard initial={board} copy={servicesCopy(workspace.labels)} />;
}
