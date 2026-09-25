import "server-only";
// Campaigns: which of the vertical's campaign templates are worth running, decided from the latest scan.
// Templates are data in the pack; the ranking is here; the wording of each one is filled from the scan.
import * as opportunitiesRepository from "@/backend/db/repositories/opportunities";
import * as scansRepository from "@/backend/db/repositories/scans";
import type { ImpactTier, OpportunityDetail } from "@/shared/types/opportunity";
import type { Campaign, CampaignBoard } from "@/shared/types/campaign";
import type { TenantContext } from "@/shared/types/tenant";
import type { VerticalCampaignTemplate, VerticalPack } from "@/shared/types/vertical";
import { getVertical } from "@/verticals";
import { getWorkspace } from "./organization-service";

export async function getBoard(ctx: TenantContext): Promise<CampaignBoard> {
  const workspace = await getWorkspace(ctx);
  const pack = getVertical(workspace.verticalId);
  const city = workspace.locationLabel.split(",")[0]!.trim();

  const recent = await scansRepository.listRecent(ctx, 20);
  const done = recent.find((scan) => scan.status === "done");
  const opportunities = done ? await opportunitiesRepository.listDetailsForScan(ctx, done.id) : [];

  // Service-led templates get one campaign per service opportunity, in the order the scan ranked them.
  const serviceOpportunities = opportunities.filter((opportunity) => opportunity.serviceSlug !== null);

  const recommended: Campaign[] = [];
  for (const template of pack.campaigns) {
    if (template.trigger === "service-opportunity") {
      const opportunity = serviceOpportunities[recommended.filter(isServiceLed).length];
      if (!opportunity) continue;
      recommended.push(toCampaign(template, pack, city, opportunity));
      continue;
    }
    recommended.push(toCampaign(template, pack, city, null));
  }

  recommended.sort((a, b) => impactRank(b.impact) - impactRank(a.impact));

  // Nothing has been launched yet: launching is not wired, so both other tabs are honestly empty.
  return { recommended, active: [], past: [] };
}

function isServiceLed(campaign: Campaign): boolean {
  return campaign.id.startsWith("service-opportunity-");
}

function impactRank(impact: ImpactTier): number {
  return impact === "high" ? 3 : impact === "medium" ? 2 : 1;
}

function toCampaign(
  template: VerticalCampaignTemplate,
  pack: VerticalPack,
  city: string,
  opportunity: OpportunityDetail | null,
): Campaign {
  const service = opportunity?.title ?? "";
  const fill = (text: string) => text.replace("{service}", service).replace("{city}", city).trim();

  const segmentName =
    pack.segments.find((segment) => segment.id === template.segmentId)?.name ?? template.segmentId;

  return {
    id: opportunity ? `service-opportunity-${opportunity.id}` : template.id,
    name: fill(template.name),
    summary: opportunity ? opportunity.note : fill(template.summary),
    pieces: template.pieces,
    segmentName,
    // A campaign built from an opportunity inherits that opportunity's impact; the rest are steady-state work.
    impact: opportunity?.impact ?? "medium",
    state: "recommended",
    theme: template.theme,
    launchedAt: null,
  };
}
