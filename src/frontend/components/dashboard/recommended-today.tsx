"use client";
// "Recommended Today": three open actions from the top opportunities. Ticking one saves it on its
// opportunity, the same record the opportunity's task list reads.
import Link from "next/link";
import { Check } from "lucide-react";
import { useActionState } from "react";
import { toggleActionAction, type ToggleActionState } from "@/app/(app)/opportunities/actions";
import type { DashboardCopy } from "@/frontend/copy/dashboard";
import type { RecommendedAction } from "@/shared/types/dashboard";
import styles from "./recommended-today.module.css";

type RecommendedTodayProps = {
  copy: DashboardCopy["recommended"];
  actions: readonly RecommendedAction[];
};

export function RecommendedToday({ copy, actions }: RecommendedTodayProps) {
  return (
    <section className={styles.card} aria-labelledby="recommended-heading">
      <h2 id="recommended-heading" className={styles.heading}>
        {copy.heading}
      </h2>
      <p className={styles.intro}>{copy.intro}</p>

      {actions.length === 0 ? (
        <p className={styles.empty}>{copy.empty}</p>
      ) : (
        <ol className={styles.list}>
          {actions.map((action) => (
            <RecommendedItem key={action.actionId} action={action} copy={copy} />
          ))}
        </ol>
      )}
    </section>
  );
}

const initial: ToggleActionState = { detail: null, error: null };

function RecommendedItem({ action, copy }: { action: RecommendedAction; copy: DashboardCopy["recommended"] }) {
  const [state, formAction, isPending] = useActionState(toggleActionAction, initial);
  const isDone = state.detail?.actions.find((candidate) => candidate.id === action.actionId)?.done ?? false;

  return (
    <li className={styles.item} data-done={isDone}>
      <form action={formAction}>
        <input type="hidden" name="opportunityId" value={action.opportunityId} />
        <input type="hidden" name="actionId" value={action.actionId} />
        <input type="hidden" name="done" value={isDone ? "false" : "true"} />
        <button
          type="submit"
          className={styles.check}
          aria-pressed={isDone}
          aria-label={`${isDone ? copy.done : copy.markDone}: ${action.label}`}
          disabled={isPending}
        >
          {isDone && <Check aria-hidden size={14} strokeWidth={3} />}
        </button>
      </form>
      <div className={styles.text}>
        <p className={styles.label}>{action.label}</p>
        <p className={styles.meta}>
          <span className={styles.effort} data-effort={action.effort}>
            {copy.effort[action.effort]}
          </span>
          {copy.from}{" "}
          <Link href={`/opportunities/${action.opportunityId}`} className={styles.link}>
            {action.opportunityTitle}
          </Link>
        </p>
        {state.error && <p className={styles.error}>{state.error}</p>}
      </div>
    </li>
  );
}
