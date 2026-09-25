import "server-only";
// Reports: one per completed scan, summarising what changed and what to do next.
// Scheduled email sending is a job that is not wired yet, so a report is built from stored scan results.
import * as opportunitiesRepository from "@/backend/db/repositories/opportunities";
import * as scansRepository from "@/backend/db/repositories/scans";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { SUB_SCORE_KEYS } from "@/shared/types/score";
import type { Report, ReportBoard } from "@/shared/types/report";
import type { TenantContext } from "@/shared/types/tenant";

const WINDOW = 20;
const TOP_OPPORTUNITIES = 3;

const HIGHLIGHT_LABELS: Record<string, string> = {
  visibility: "Visibility",
  maps: "Google Maps",
  website: "Website SEO",
  "ai-search": "AI Search",
  reviews: "Reviews",
  conversion: "Conversion",
};

export async function getBoard(ctx: TenantContext): Promise<ReportBoard> {
  const recent = await scansRepository.listRecent(ctx, WINDOW);
  const completed = recent.filter((scan) => scan.status === "done");

  const reports = await Promise.all(
    completed.map(async (scan, index) => {
      const previous = completed[index + 1] ?? null;
      const [scores, previousScores, opportunities] = await Promise.all([
        scoresRepository.listForScan(ctx, scan.id),
        previous ? scoresRepository.listForScan(ctx, previous.id) : Promise.resolve([]),
        opportunitiesRepository.listForScan(ctx, scan.id, TOP_OPPORTUNITIES),
      ]);

      const previousByKey = new Map(previousScores.map((score) => [score.key, score.value]));
      const byKey = new Map(scores.map((score) => [score.key, score.value]));
      const growth = byKey.get("growth") ?? null;
      const previousGrowth = previousByKey.get("growth") ?? null;

      const report: Report = {
        id: scan.id,
        periodLabel: periodLabel(scan.finishedAt ?? scan.startedAt),
        generatedAt: scan.finishedAt ?? scan.startedAt,
        growthScore: growth,
        growthDelta: growth !== null && previousGrowth !== null ? growth - previousGrowth : null,
        highlights: SUB_SCORE_KEYS.flatMap((key) => {
          const value = byKey.get(key);
          if (value === undefined) return [];
          const before = previousByKey.get(key);
          return [
            {
              label: HIGHLIGHT_LABELS[key] ?? key,
              value: `${value}/100`,
              delta: before === undefined ? null : value - before,
            },
          ];
        }),
        topOpportunities: opportunities.map((opportunity) => opportunity.title),
        estimatedMonthlyBookings: opportunities[0]?.estimatedMonthlyBookings ?? null,
      };
      return report;
    }),
  );

  return { reports, isDerivedFromScans: true };
}

function periodLabel(iso: string): string {
  const end = new Date(iso);
  const start = new Date(end.getTime() - 6 * 86_400_000);
  const format = (date: Date) => date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
}
