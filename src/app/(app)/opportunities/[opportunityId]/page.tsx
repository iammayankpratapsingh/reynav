// One opportunity, with its overview, competitors, content plan and tasks.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getDetail } from "@/backend/services/opportunity-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { OpportunityDetail } from "@/frontend/components/opportunities/opportunity-detail";
import { opportunitiesCopy } from "@/frontend/copy/opportunities";
import { isAppError } from "@/shared/errors";

export const metadata: Metadata = {
  title: "Opportunity — REYNAV",
};

export default async function OpportunityPage({ params }: { params: Promise<{ opportunityId: string }> }) {
  const { opportunityId } = await params;
  const ctx = await requireTenant();

  const [workspace, detail] = await Promise.all([
    getWorkspace(ctx),
    getDetail(ctx, opportunityId).catch((error: unknown) => {
      if (isAppError(error) && error.code === "not_found") return null;
      throw error;
    }),
  ]);
  if (!detail) notFound();

  return (
    <OpportunityDetail
      detail={detail}
      copy={opportunitiesCopy(workspace.labels).detail}
      city={workspace.locationLabel.split(",")[0]!.trim()}
      bookingWord={workspace.labels.bookingPlural.toLowerCase()}
    />
  );
}
