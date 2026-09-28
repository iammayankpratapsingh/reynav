import "server-only";
// Growth plans: one per location per month, with its daily tasks and which are done.
import { getSql, isUuid } from "@/backend/db/client";
import type { PlanTask } from "@/shared/types/growth-plan";
import type { TenantContext } from "@/shared/types/tenant";

export type StoredPlan = {
  id: string;
  period: string;
  startsOn: string;
  tasks: (PlanTask & { serviceSlug: string })[];
};

export type NewPlanTask = Omit<PlanTask, "id" | "done"> & { serviceSlug: string };

type PlanRow = { id: string; period: string; starts_on: string };

type TaskRow = {
  id: string;
  week: number;
  day: number;
  due_on: string;
  service_slug: string;
  service_name: string;
  label: string;
  effort: string;
  done: boolean;
};

export async function findForPeriod(ctx: TenantContext, locationId: string, period: string): Promise<StoredPlan | null> {
  if (!isUuid(locationId)) return null;
  const [plan] = await getSql()<PlanRow[]>`
    select id, period, starts_on from growth_plans
    where organization_id = ${ctx.organizationId} and location_id = ${locationId} and period = ${period}
  `;
  return plan ? withTasks(ctx, plan) : null;
}

export async function findLatest(ctx: TenantContext, locationId: string): Promise<StoredPlan | null> {
  if (!isUuid(locationId)) return null;
  const [plan] = await getSql()<PlanRow[]>`
    select id, period, starts_on from growth_plans
    where organization_id = ${ctx.organizationId} and location_id = ${locationId}
    order by period desc
    limit 1
  `;
  return plan ? withTasks(ctx, plan) : null;
}

/** Idempotent: a plan that already exists for the period is left as it is, done ticks included. */
export async function create(
  ctx: TenantContext,
  input: { locationId: string; period: string; scanId: string; startsOn: string; tasks: readonly NewPlanTask[] },
): Promise<void> {
  await getSql().begin(async (tx) => {
    const [plan] = await tx<{ id: string }[]>`
      insert into growth_plans (organization_id, location_id, period, scan_id, starts_on)
      values (${ctx.organizationId}, ${input.locationId}, ${input.period}, ${input.scanId}, ${input.startsOn})
      on conflict (location_id, period) do nothing
      returning id
    `;
    if (!plan || input.tasks.length === 0) return;
    const rows = input.tasks.map((task) => ({
      organization_id: ctx.organizationId,
      plan_id: plan.id,
      week: task.week,
      day: task.day,
      due_on: task.dueOn,
      service_slug: task.serviceSlug,
      service_name: task.serviceName,
      label: task.label,
      effort: task.effort,
    }));
    await tx`insert into growth_plan_tasks ${tx(rows)}`;
  });
}

export async function setTaskDone(ctx: TenantContext, taskId: string, done: boolean): Promise<boolean> {
  if (!isUuid(taskId)) return false;
  const updated = await getSql()`
    update growth_plan_tasks set
      done = ${done},
      done_at = ${done ? new Date().toISOString() : null},
      updated_at = now()
    where id = ${taskId} and organization_id = ${ctx.organizationId}
  `;
  return updated.count > 0;
}

async function withTasks(ctx: TenantContext, plan: PlanRow): Promise<StoredPlan> {
  const rows = await getSql()<TaskRow[]>`
    select id, week, day, due_on, service_slug, service_name, label, effort, done
    from growth_plan_tasks
    where plan_id = ${plan.id} and organization_id = ${ctx.organizationId}
    order by week, day, created_at, id
  `;
  const tasks = rows.map((row) => ({
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
