import "server-only";
// The workspace header data every authenticated screen needs: who the tenant is and which vertical they run.
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as locationsRepository from "@/backend/db/repositories/locations";
import * as organizationsRepository from "@/backend/db/repositories/organizations";
import { NotFoundError } from "@/shared/errors";
import type { TenantContext } from "@/shared/types/tenant";
import type { VerticalLabels } from "@/shared/types/vertical";
import { getVertical } from "@/verticals";

export type Workspace = {
  organizationName: string;
  businessName: string;
  locationLabel: string;
  verticalId: string;
  labels: VerticalLabels;
};

export async function getWorkspace(ctx: TenantContext): Promise<Workspace> {
  const [organization, business, location] = await Promise.all([
    organizationsRepository.findForContext(ctx),
    businessesRepository.findPrimary(ctx),
    locationsRepository.findPrimary(ctx),
  ]);

  if (!organization || !business || !location) {
    throw new NotFoundError(`Incomplete workspace for organisation ${ctx.organizationId}`);
  }

  return {
    organizationName: organization.name,
    businessName: business.name,
    locationLabel: location.label,
    verticalId: business.verticalId,
    labels: getVertical(business.verticalId).manifest.labels,
  };
}
