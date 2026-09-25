import "server-only";
// AI search visibility: the AI answers stored by the latest scan, grouped by service and location, compared
// with the scan before, plus the mention rate over time. Reads stored checks; never calls a provider.
import * as aiVisibilityRepository from "@/backend/db/repositories/ai-visibility";
import * as scansRepository from "@/backend/db/repositories/scans";
import * as scoresRepository from "@/backend/db/repositories/scores";
import {
  AI_SURFACES,
  type AiSearchBoard,
  type AiServiceVisibility,
  type AiVisibilityCheck,
} from "@/shared/types/ai-search";
import type { TenantContext } from "@/shared/types/tenant";

const RECENT_WINDOW = 20;

export async function getBoard(ctx: TenantContext): Promise<AiSearchBoard> {
  const recent = (await scansRepository.listRecent(ctx, RECENT_WINDOW)).filter((scan) => scan.status === "done");
  const withChecks = [];
  for (const scan of recent) {
    const checks = await aiVisibilityRepository.listForScan(ctx, scan.id);
    if (checks.length > 0) withChecks.push({ scan, checks });
  }

  const latest = withChecks[0];
  if (!latest) return { scanId: null, scannedAt: null, score: null, bySurface: [], services: [], history: [] };
  const previous = withChecks[1] ?? null;

  const [score, previousScore] = await Promise.all([
    scoresRepository.listForScan(ctx, latest.scan.id),
    previous ? scoresRepository.listForScan(ctx, previous.scan.id) : Promise.resolve([]),
  ]);
  const aiScore = score.find((row) => row.key === "ai-search");

  return {
    scanId: latest.scan.id,
    scannedAt: latest.scan.finishedAt ?? latest.scan.startedAt,
    score: aiScore
      ? { value: aiScore.value, previous: previousScore.find((row) => row.key === "ai-search")?.value ?? null }
      : null,
    bySurface: AI_SURFACES.map((surface) => {
      const onSurface = latest.checks.filter((check) => check.surface === surface);
      return { surface, mentioned: onSurface.filter((check) => check.wasMentioned).length, total: onSurface.length };
    }),
    services: groupByService(latest.checks, previous?.checks ?? null),
    history: withChecks
      .map(({ scan, checks }) => ({
        scanId: scan.id,
        at: scan.finishedAt ?? scan.startedAt,
        mentionRate: Math.round((checks.filter((check) => check.wasMentioned).length / checks.length) * 100),
      }))
      .reverse(),
  };
}

/** One row per prompt (a service, or the business type) and location, with each surface's answer. */
function groupByService(
  checks: readonly AiVisibilityCheck[],
  previous: readonly AiVisibilityCheck[] | null,
): AiServiceVisibility[] {
  const key = (check: AiVisibilityCheck) => `${check.serviceSlug ?? "general"}|${check.locationLabel}|${check.prompt}`;
  const groups = new Map<string, AiVisibilityCheck[]>();
  for (const check of checks) groups.set(key(check), [...(groups.get(key(check)) ?? []), check]);

  return [...groups.entries()].map(([groupKey, rows]) => {
    const first = rows[0]!;
    const before = previous?.filter((check) => key(check) === groupKey) ?? [];
    return {
      key: groupKey,
      serviceName: first.serviceName,
      locationLabel: first.locationLabel,
      prompt: first.prompt,
      results: rows.map((row) => ({
        surface: row.surface,
        wasMentioned: row.wasMentioned,
        position: row.position,
        namedCount: row.namedCount,
      })),
      previousMentions: before.length === 0 ? null : before.filter((check) => check.wasMentioned).length,
    };
  });
}
