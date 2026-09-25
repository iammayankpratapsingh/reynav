"use client";
// The 30-day plan: progress, today's task up top, then each focus week with its seven daily tasks.
import { CalendarCheck, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { togglePlanTaskAction } from "@/app/(app)/growth-plan/actions";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import type { GrowthPlanCopy } from "@/frontend/copy/growth-plan";
import type { GrowthPlan, PlanTask } from "@/shared/types/growth-plan";
import styles from "@/frontend/components/app/data.module.css";
import local from "./growth-plan-board.module.css";

type Props = { initial: GrowthPlan | null; today: string; copy: GrowthPlanCopy };

function formatDay(iso: string): string {
  return new Date(`${iso}T12:00:00.000Z`).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function GrowthPlanBoard({ initial, today, copy }: Props) {
  const [plan, setPlan] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (!plan) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState
          icon={<CalendarCheck aria-hidden size={26} />}
          heading={copy.empty.heading}
          body={copy.empty.body}
          cta={copy.empty.cta}
        />
      </div>
    );
  }

  const toggle = (task: PlanTask) => {
    setPendingId(task.id);
    startTransition(async () => {
      const result = await togglePlanTaskAction({ taskId: task.id, done: !task.done });
      setPendingId(null);
      if (result.plan) {
        setPlan(result.plan);
        setError(null);
      } else setError(result.error);
    });
  };

  const tasks = plan.weeks.flatMap((week) => week.tasks);
  const todays = tasks.find((task) => task.dueOn === today && !task.done);
  const next = todays ?? tasks.find((task) => !task.done && task.dueOn >= today) ?? tasks.find((task) => !task.done);
  const month = new Date(`${plan.period}-15T12:00:00.000Z`).toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const percent = plan.totalCount === 0 ? 0 : Math.round((plan.doneCount / plan.totalCount) * 100);

  return (
    <div className={styles.page}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} action={<p className={styles.meta}>{month}</p>} />

      <section className={local.hero} aria-label={copy.today.heading}>
        <div className={local.progress}>
          <p className={local.progressLabel}>
            {copy.progress.replace("{done}", String(plan.doneCount)).replace("{total}", String(plan.totalCount))}
          </p>
          <span
            className={styles.meter}
            role="progressbar"
            aria-label={copy.title}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <span className={styles.meterFill} data-tone="good" style={{ width: `${percent}%` }} />
          </span>
        </div>
        <div className={local.todayCard}>
          <p className={local.todayLabel}>{todays ? copy.today.heading : copy.today.next}</p>
          {next ? (
            <div className={local.todayRow}>
              <TaskCheck task={next} copy={copy} isPending={pendingId === next.id} onToggle={toggle} />
              <div>
                <p className={local.todayText}>{next.label}</p>
                <p className={styles.listSub}>
                  {formatDay(next.dueOn)} · {next.serviceName} · {copy.effort[next.effort]}
                </p>
              </div>
            </div>
          ) : (
            <p className={styles.muted}>{copy.today.allDone}</p>
          )}
        </div>
      </section>

      {error && (
        <p role="alert" className={local.error}>
          {error}
        </p>
      )}

      <div className={styles.grid2}>
        {plan.weeks.map((week) => {
          const done = week.tasks.filter((task) => task.done).length;
          return (
            <Panel
              key={week.week}
              title={copy.weekHeading.replace("{week}", String(week.week)).replace("{service}", week.serviceName)}
              action={
                <span className={styles.chip} data-tone={done === week.tasks.length ? "good" : undefined}>
                  {done}/{week.tasks.length}
                </span>
              }
            >
              <p className={styles.intro}>{copy.whyWeek.replace("{score}", String(week.opportunityScore))}</p>
              <ol className={local.tasks}>
                {week.tasks.map((task) => (
                  <li key={task.id} className={local.task} data-done={task.done} data-today={task.dueOn === today}>
                    <TaskCheck task={task} copy={copy} isPending={pendingId === task.id} onToggle={toggle} />
                    <div className={local.taskText}>
                      <p className={local.taskLabel}>{task.label}</p>
                      <p className={styles.listSub}>
                        {formatDay(task.dueOn)} · {copy.effort[task.effort]}
                        {task.dueOn === today && <span className={local.todayBadge}>{copy.todayBadge}</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          );
        })}
      </div>

      <p className={styles.note}>{copy.note}</p>
    </div>
  );
}

function TaskCheck({
  task,
  copy,
  isPending,
  onToggle,
}: {
  task: PlanTask;
  copy: GrowthPlanCopy;
  isPending: boolean;
  onToggle: (task: PlanTask) => void;
}) {
  return (
    <button
      type="button"
      className={styles.check}
      aria-pressed={task.done}
      aria-label={`${task.done ? copy.markUndone : copy.markDone}: ${task.label}`}
      disabled={isPending}
      onClick={() => onToggle(task)}
    >
      {task.done && <Check aria-hidden size={14} strokeWidth={3} />}
    </button>
  );
}
