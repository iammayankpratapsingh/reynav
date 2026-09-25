import "server-only";
// Competitor intelligence: the rivals stored by the latest scan, the business beside them, what changed,
// and the pages they have that the business does not. Reads stored snapshots; never calls a provider.
import * as competitorsRepository from "@/backend/db/repositories/competitors";
import * as scansRepository from "@/backend/db/repositories/scans";
import type { CompetitorBoard, CompetitorChange, CompetitorProfile, MissingPage } from "@/shared/types/competitor";
import type { TenantContext } from "@/shared/types/tenant";
import { getWorkspace } from "./organization-service";

const RECENT_WINDOW = 20;
/** A rival's number has to beat the business's by this factor before it is worth a line in the feed. */
const NOTABLE_FACTOR = 1.5;
const MAX_CHANGES = 8;

export async function getBoard(ctx: TenantContext): Promise<CompetitorBoard> {
  const [workspace, recent] = await Promise.all([getWorkspace(ctx), scansRepository.listRecent(ctx, RECENT_WINDOW)]);

  for (const scan of recent) {
    const profiles = await competitorsRepository.listForScan(ctx, scan.id);
    if (profiles.length === 0) continue;
    const you = profiles.find((profile) => profile.isYou) ?? null;
    const competitors = profiles
      .filter((profile) => !profile.isYou)
      .sort((a, b) => (a.averageMapPosition ?? 99) - (b.averageMapPosition ?? 99));
    return {
      scanId: scan.id,
      scannedAt: scan.finishedAt ?? scan.startedAt,
      locationLabel: workspace.locationLabel,
      you,
      competitors,
      changes: you ? findChanges(you, competitors) : [],
      missingPages: you ? findMissingPages(you, competitors) : [],
    };
  }

  return {
    scanId: null,
    scannedAt: null,
    locationLabel: workspace.locationLabel,
    you: null,
    competitors: [],
    changes: [],
    missingPages: [],
  };
}

/** Where a rival is clearly out-working the business this period: reviews, posts, photos. */
function findChanges(you: CompetitorProfile, competitors: readonly CompetitorProfile[]): CompetitorChange[] {
  const metrics = [
    { metric: "reviews", pick: (profile: CompetitorProfile) => profile.reviewsLast30Days },
    { metric: "posts", pick: (profile: CompetitorProfile) => profile.postsLast90Days },
    { metric: "photos", pick: (profile: CompetitorProfile) => profile.photoCount },
  ] as const;

  const changes: (CompetitorChange & { gap: number })[] = [];
  for (const rival of competitors) {
    for (const { metric, pick } of metrics) {
      const theirs = pick(rival);
      const yours = pick(you);
      if (theirs > Math.max(yours, 1) * NOTABLE_FACTOR) {
        changes.push({
          id: `${rival.name}-${metric}`,
          competitorName: rival.name,
          metric,
          theirs,
          yours,
          gap: theirs / Math.max(yours, 1),
        });
      }
    }
  }
  return changes
    .sort((a, b) => b.gap - a.gap)
    .slice(0, MAX_CHANGES)
    .map(({ gap: _gap, ...change }) => change);
}

/** Page topics two or more rivals have and the business does not, most common first. */
function findMissingPages(you: CompetitorProfile, competitors: readonly CompetitorProfile[]): MissingPage[] {
  const yours = new Set(you.pageTopics.map((topic) => topic.toLowerCase()));
  const byTopic = new Map<string, { topic: string; names: string[] }>();
  for (const rival of competitors) {
    for (const topic of rival.pageTopics) {
      const key = topic.toLowerCase();
      if (yours.has(key)) continue;
      const entry = byTopic.get(key) ?? { topic, names: [] };
      if (!entry.names.includes(rival.name)) entry.names.push(rival.name);
      byTopic.set(key, entry);
    }
  }
  return [...byTopic.values()]
    .filter((entry) => entry.names.length >= 2)
    .sort((a, b) => b.names.length - a.names.length || a.topic.localeCompare(b.topic))
    .map((entry) => ({ topic: entry.topic, competitorNames: entry.names }));
}
