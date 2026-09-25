import "server-only";
// The content catalogue: which pieces this vertical publishes, grouped by channel, with the ones the latest
// scan actually calls for marked as suggested.
import * as opportunitiesRepository from "@/backend/db/repositories/opportunities";
import * as scansRepository from "@/backend/db/repositories/scans";
import type { TenantContext } from "@/shared/types/tenant";
import type { ContentCatalogue, ContentTemplate } from "@/shared/types/content";
import { getVertical } from "@/verticals";
import { getWorkspace } from "./organization-service";

export async function getCatalogue(ctx: TenantContext): Promise<ContentCatalogue> {
  const workspace = await getWorkspace(ctx);
  const pack = getVertical(workspace.verticalId);

  const recent = await scansRepository.listRecent(ctx, 20);
  const done = recent.find((scan) => scan.status === "done");
  const opportunities = done ? await opportunitiesRepository.listDetailsForScan(ctx, done.id) : [];

  // First opportunity that asks for a piece wins the label, because that is the one to do first.
  const suggestedBy = new Map<string, string>();
  for (const opportunity of opportunities) {
    for (const piece of opportunity.contentPlan) {
      if (!suggestedBy.has(piece.contentTypeId)) suggestedBy.set(piece.contentTypeId, opportunity.title);
    }
  }

  const templates: ContentTemplate[] = pack.contentTypes.map((template) => ({
    ...template,
    isSuggested: suggestedBy.has(template.id),
    suggestedFor: suggestedBy.get(template.id) ?? null,
  }));

  const channels = [...new Set(templates.map((template) => template.channel))];

  return { channels, templates, suggestedCount: suggestedBy.size };
}
