import "server-only";
// Growth plans: one per location per month, with its daily tasks and which are done.
import { db } from "@/backend/db/client";
import type { PlanTask } from "@/shared/types/growth-plan";
import type { TenantContext } from "@/shared/types/tenant";

export type StoredPlan = {
  id: string;
  period: string;
  startsOn: string;
  tasks: (PlanTask & { serviceSlug: string })[];
};

export type NewPlanTask = Omit<PlanTask, "id" | "done"> & { serviceSlug: string };

export async function findForPeriod(ctx: TenantContext, locationId: string, period: string): Promise<StoredPlan | null> {
  const plan = db.growthPlans.find(
    (row) => row.organization_id === ctx.organizationId && row.location_id === locationId && row.period === period,
  );
  return plan ? withTasks(ctx, plan) : null;
}

export async function findLatest(ctx: TenantContext, locationId: string): Promise<StoredPlan | null> {
  const [plan] = db.growthPlans
    .filter((row) => row.organization_id === ctx.organizationId && row.location_id === locationId)
    .sort((a, b) => b.period.localeCompare(a.period));
  return plan ? withTasks(ctx, plan) : null;
}

export async function create(
  ctx: TenantContext,
  input: { locationId: string; period: string; scanId: string; startsOn: string; tasks: readonly NewPlanTask[] },
): Promise<void> {
  const id = `plan_${ctx.organizationId}_${input.locationId}_${input.period}`;
  if (db.growthPlans.findById(id)) return;
  db.growthPlans.insert({
    id,
    organization_id: ctx.organizationId,
    location_id: input.locationId,
    period: input.period,
    scan_id: input.scanId,
    starts_on: input.startsOn,
    created_at: new Date().toISOString(),
  });
  for (const task of input.tasks) {
    db.growthPlanTasks.insert({
      id: `${id}_w${task.week}d${task.day}`,
      organization_id: ctx.organizationId,
      plan_id: id,
      week: task.week,
      day: task.day,
      due_on: task.dueOn,
      service_slug: task.serviceSlug,
      service_name: task.serviceName,
      label: task.label,
      effort: task.effort,
      done: false,
      done_at: null,
    });
  }
}

export async function setTaskDone(ctx: TenantContext, taskId: string, done: boolean): Promise<boolean> {
  const row = db.growthPlanTasks.findById(taskId);
  if (!row || row.organization_id !== ctx.organizationId) return false;
  db.growthPlanTasks.update(taskId, { done, done_at: done ? new Date().toISOString() : null });
  return true;
}

function withTasks(ctx: TenantContext, plan: { id: string; period: string; starts_on: string }): StoredPlan {
  const tasks = db.growthPlanTasks
    .filter((row) => row.organization_id === ctx.organizationId && row.plan_id === plan.id)
    .sort((a, b) => a.week - b.week || a.day - b.day)
    .map((row) => ({
      id: row.id,
      week: row.week,
      day: row.day,
      dueOn: row.due_on,
      serviceSlug: row.service_slug,
      serviceName: row.service_name,
      label: row.label,
      effort: row.effort as PlanTask["effort"],
      done: row.done,
    }));
  return { id: plan.id, period: plan.period, startsOn: plan.starts_on, tasks };
}
