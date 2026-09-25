import "server-only";
// The 30-day growth plan. Built once a month from the service scores (demand × competition × conversion ×
// price × ranking): the four best services get a focus week each, one task a day. Progress is kept for the
// month; next month's first scan writes a fresh plan.
import * as growthPlansRepository from "@/backend/db/repositories/growth-plans";
import { NotFoundError } from "@/shared/errors";
import type { GrowthPlan, PlanWeek } from "@/shared/types/growth-plan";
import type { TenantContext } from "@/shared/types/tenant";
import { getVertical } from "@/verticals";
import { requirePrimaryLocation } from "./onboarding-service";
import { getWorkspace } from "./organization-service";
import * as serviceIntelligence from "./service-intelligence-service";

const FOCUS_WEEKS = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Writes this month's plan if the location has none yet. Safe to run on every scan. */
export async function buildIfMissing(ctx: TenantContext, input: { scanId: string; now: Date }): Promise<void> {
  const [workspace, location] = await Promise.all([getWorkspace(ctx), requirePrimaryLocation(ctx)]);
  const period = input.now.toISOString().slice(0, 7);
  if (await growthPlansRepository.findForPeriod(ctx, location.id, period)) return;

  const board = await serviceIntelligence.getBoard(ctx);
  const focus = board.services.slice(0, FOCUS_WEEKS);
  if (focus.length === 0) return;

  const pack = getVertical(workspace.verticalId);
  const city = location.address?.city ?? location.label.split(",")[0]!.trim();
  const startsOn = input.now.toISOString().slice(0, 10);
  const start = new Date(`${startsOn}T00:00:00.000Z`).getTime();

  await growthPlansRepository.create(ctx, {
    locationId: location.id,
    period,
    scanId: input.scanId,
    startsOn,
    tasks: focus.flatMap((service, weekIndex) =>
      pack.planTasks.map((task, dayIndex) => ({
        week: weekIndex + 1,
        day: dayIndex + 1,
        dueOn: new Date(start + (weekIndex * 7 + dayIndex) * DAY_MS).toISOString().slice(0, 10),
        serviceSlug: service.serviceSlug,
        serviceName: service.serviceName,
        label: task.label.replaceAll("{service}", service.serviceName).replaceAll("{city}", city),
        effort: task.effort,
      })),
    ),
  });
}

export async function getPlan(ctx: TenantContext): Promise<GrowthPlan | null> {
  const location = await requirePrimaryLocation(ctx);
  const stored = await growthPlansRepository.findLatest(ctx, location.id);
  if (!stored) return null;

  const scores = new Map(
    (await serviceIntelligence.getBoard(ctx)).services.map((row) => [row.serviceSlug, row.opportunityScore]),
  );
  const weeks: PlanWeek[] = [];
  for (const task of stored.tasks) {
    let week = weeks.find((candidate) => candidate.week === task.week);
    if (!week) {
      week = {
        week: task.week,
        serviceSlug: task.serviceSlug,
        serviceName: task.serviceName,
        opportunityScore: scores.get(task.serviceSlug) ?? 0,
        tasks: [],
      };
      weeks.push(week);
    }
    const { serviceSlug: _slug, ...rest } = task;
    week.tasks.push(rest);
  }

  return {
    id: stored.id,
    period: stored.period,
    startsOn: stored.startsOn,
    weeks,
    doneCount: stored.tasks.filter((task) => task.done).length,
    totalCount: stored.tasks.length,
  };
}

export async function setTaskDone(ctx: TenantContext, taskId: string, done: boolean): Promise<GrowthPlan | null> {
  if (!(await growthPlansRepository.setTaskDone(ctx, taskId, done))) {
    throw new NotFoundError(`No plan task ${taskId} for ${ctx.organizationId}`);
  }
  return getPlan(ctx);
}
