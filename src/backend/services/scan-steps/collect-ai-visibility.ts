import "server-only";
// Step: ask AI answers (Google's AI Overview and chat assistants) the questions customers ask, store every
// answer, then score how often the business is named.
import { getAiVisibilityProvider } from "@/backend/adapters/ai-visibility";
import * as aiVisibilityRepository from "@/backend/db/repositories/ai-visibility";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { aiVisibilityV1, VERSION } from "@/backend/scoring/sub-scores/ai-visibility.v1";
import type { ScanContext } from "./scan-context";
import { writeSignals } from "./step-store";

export async function collectAiVisibility(scan: ScanContext): Promise<void> {
  const mentions = await getAiVisibilityProvider().getMentions({
    prompts: scan.aiPrompts.map((row) => row.prompt),
    businessName: scan.businessName,
  });
  writeSignals(scan.scanId, { mentions });

  const byPrompt = new Map(scan.aiPrompts.map((row) => [row.prompt, row]));
  await aiVisibilityRepository.replaceForScan(scan.tenant, {
    scanId: scan.scanId,
    locationId: scan.locationId,
    checks: mentions.map((mention) => ({
      prompt: mention.prompt,
      serviceSlug: byPrompt.get(mention.prompt)?.serviceSlug ?? null,
      serviceName: byPrompt.get(mention.prompt)?.serviceName ?? null,
      locationLabel: scan.geo.label,
      surface: mention.surface,
      wasMentioned: mention.wasMentioned,
      position: mention.position,
      namedCount: mention.namedCount,
    })),
  });

  const value = aiVisibilityV1({
    results: mentions.map((mention) => ({
      prompt: mention.prompt,
      wasMentioned: mention.wasMentioned,
      position: mention.position,
      namedCount: mention.namedCount,
    })),
    ...scan.pack.benchmarks.aiVisibility,
  });

  await scoresRepository.put(scan.tenant, scan.scanId, { key: "ai-search", value, version: VERSION });
}
