import "server-only";
// Owner notifications: what is new and worth a look, shown under the bell on Home. Built from results the
// other services already hold — nothing here calls a provider or computes a score. Each source is optional,
// so one failing never empties the bell.
import type { AppNotification } from "@/shared/types/notification";
import type { TenantContext } from "@/shared/types/tenant";
import * as competitorService from "./competitor-service";
import * as dashboardService from "./dashboard-service";
import * as growthPlanService from "./growth-plan-service";
import * as reviewService from "./review-service";

const MAX_NOTIFICATIONS = 8;

export async function listForOwner(ctx: TenantContext, now: Date): Promise<AppNotification[]> {
  const [dashboard, reviews, competitors, plan] = await Promise.allSettled([
    dashboardService.getDashboard(ctx),
    reviewService.getBoard(ctx),
    competitorService.getBoard(ctx),
    growthPlanService.getPlan(ctx),
  ]);
  const nowIso = now.toISOString();
  const today = nowIso.slice(0, 10);
  const items: AppNotification[] = [];

  if (dashboard.status === "fulfilled" && dashboard.value.scan?.status === "done" && dashboard.value.scores.growth) {
    const { scan, scores, opportunities } = dashboard.value;
    items.push({
      id: `scan-${scan!.scanId}`,
      kind: "scan",
      score: scores.growth!.value,
      delta: scores.growth!.deltaVsPrevious,
      href: "/dashboard",
      at: nowIso,
    });
    const top = opportunities[0];
    if (top?.estimatedMonthlyBookings) {
      items.push({
        id: `opportunity-${top.id}`,
        kind: "opportunity",
        title: top.title,
        low: top.estimatedMonthlyBookings.low,
        high: top.estimatedMonthlyBookings.high,
        href: `/opportunities/${top.id}`,
        at: nowIso,
      });
    }
  }

  if (plan.status === "fulfilled" && plan.value) {
    const task = plan.value.weeks
      .flatMap((week) => week.tasks)
      .find((candidate) => candidate.dueOn === today && !candidate.done);
    if (task) items.push({ id: `plan-${task.id}`, kind: "plan", task: task.label, href: "/growth-plan", at: nowIso });
  }

  if (reviews.status === "fulfilled" && reviews.value.awaitingReply > 0) {
    const newest = reviews.value.reviews.find((review) => review.reply === null) ?? null;
    items.push({
      id: `reviews-${reviews.value.awaitingReply}-${newest?.id ?? "none"}`,
      kind: "reviews",
      count: reviews.value.awaitingReply,
      latestAuthor: newest?.authorName ?? null,
      latestText: newest?.text ?? null,
      href: "/reviews",
      at: newest?.postedAt ?? nowIso,
    });
  }

  if (competitors.status === "fulfilled") {
    const change = competitors.value.changes[0];
    if (change && competitors.value.scanId) {
      items.push({
        id: `competitor-${competitors.value.scanId}-${change.id}`,
        kind: "competitor",
        name: change.competitorName,
        metric: change.metric,
        theirs: change.theirs,
        yours: change.yours,
        href: "/competitors",
        at: competitors.value.scannedAt ?? nowIso,
      });
    }
  }

  return items.slice(0, MAX_NOTIFICATIONS);
}
