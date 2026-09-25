"use client";
// One opportunity, across four tabs. Every figure was computed during the scan and stored; nothing here
// recalculates anything, and every estimate is shown as the range it is.
import { ArrowLeft, Check, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { toggleActionAction, type ToggleActionState } from "@/app/(app)/opportunities/actions";
import { TabNav } from "@/frontend/components/app/tab-nav";
import type { OpportunitiesCopy } from "@/frontend/copy/opportunities";
import type { OpportunityDetail as Detail } from "@/shared/types/opportunity";
import styles from "./opportunity-detail.module.css";

type Props = {
  detail: Detail;
  copy: OpportunitiesCopy["detail"];
  city: string;
  /** Vertical word for a booking, already pluralised. */
  bookingWord: string;
};

const initialToggle: ToggleActionState = { detail: null, error: null };

export function OpportunityDetail({ detail: initial, copy, city, bookingWord }: Props) {
  const [tab, setTab] = useState("overview");
  const [toggleState, toggleAction] = useActionState(toggleActionAction, initialToggle);
  const detail = toggleState.detail ?? initial;

  const badge =
    detail.impact === "high" ? copy.highBadge : detail.impact === "medium" ? copy.mediumBadge : copy.lowBadge;

  return (
    <div className={styles.page}>
      <Link href="/opportunities" className={styles.back}>
        <ArrowLeft aria-hidden size={17} />
        {copy.back}
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          {detail.title}
          {detail.serviceSlug && <span className={styles.city}> – {city}</span>}
        </h1>
        <span className={styles.badge} data-impact={detail.impact}>
          {badge}
        </span>
      </header>

      <TabNav tabs={copy.tabs} active={tab} onChange={setTab} label={detail.title} />

      {toggleState.error && (
        <p role="alert" className={styles.error}>
          {toggleState.error}
        </p>
      )}

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "overview" && <Overview detail={detail} copy={copy} bookingWord={bookingWord} />}
        {tab === "competitors" && <Competitors detail={detail} copy={copy.competitors} />}
        {tab === "content" && <ContentPlan detail={detail} copy={copy.content} />}
        {tab === "tasks" && (
          <Tasks detail={detail} copy={copy.tasks} effortCopy={copy.recommendation.effort} action={toggleAction} />
        )}
      </div>
    </div>
  );
}

function Overview({ detail, copy, bookingWord }: { detail: Detail; copy: Props["copy"]; bookingWord: string }) {
  const stats = [
    {
      label: copy.stats.searches,
      value: detail.monthlySearches === null ? copy.stats.unknown : detail.monthlySearches.toLocaleString("en-CA"),
      tone: "plain" as const,
    },
    {
      label: copy.stats.yourRank,
      value: detail.yourPosition === null ? copy.stats.unranked : `#${detail.yourPosition}`,
      tone: "brand" as const,
    },
    {
      label: copy.stats.competitorRank,
      value: detail.topCompetitorPosition === null ? copy.stats.unknown : `#${detail.topCompetitorPosition}`,
      tone: "warn" as const,
    },
    {
      label: copy.stats.missed,
      value: detail.estimatedMonthlyBookings
        ? `${detail.estimatedMonthlyBookings.low} – ${detail.estimatedMonthlyBookings.high} ${copy.stats.perMonth}`
        : copy.stats.unknown,
      tone: "brand" as const,
    },
    {
      label: copy.stats.revenue,
      value: detail.estimatedMonthlyRevenue
        ? `$${detail.estimatedMonthlyRevenue.low.toLocaleString("en-CA")} – $${detail.estimatedMonthlyRevenue.high.toLocaleString("en-CA")}`
        : copy.stats.unknown,
      tone: "brand" as const,
    },
  ];

  return (
    <div className={styles.overview}>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statRow} data-tone={stat.tone}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </div>
        ))}
      </div>

      <aside className={styles.aside}>
        <div className={styles.artwork} aria-hidden>
          <span className={styles.artworkGlow} />
          <span className={styles.artworkWord}>{detail.title}</span>
        </div>
        <blockquote className={styles.quote}>
          <p className={styles.quoteText}>
            <strong>{detail.title}</strong> is one of the most searched services in your area. Rank higher and it turns
            into {bookingWord} you are currently missing.
          </p>
          <footer className={styles.quoteFoot}>{copy.quote.attribution}</footer>
          <p className={styles.quoteNote}>{copy.quote.estimateNote}</p>
        </blockquote>
      </aside>

      <section className={styles.recommendation}>
        <h2 className={styles.recommendationHead}>
          <Sparkles aria-hidden size={20} />
          {copy.recommendation.heading}
        </h2>
        <ul className={styles.recommendationList}>
          {detail.actions.map((action) => (
            <li key={action.id} className={styles.recommendationItem}>
              <Check aria-hidden size={17} />
              <span>{action.label}</span>
              <span className={styles.effort} data-effort={action.effort}>
                {copy.recommendation.effort[action.effort]}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Competitors({ detail, copy }: { detail: Detail; copy: Props["copy"]["competitors"] }) {
  if (detail.competitors.length === 0) return <p className={styles.empty}>{copy.empty}</p>;

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{copy.heading}</h2>
      <ul className={styles.competitorList}>
        {detail.competitors.map((competitor) => (
          <li key={competitor.name} className={styles.competitor}>
            <div className={styles.competitorMain}>
              <p className={styles.competitorName}>{competitor.name}</p>
              <p className={styles.competitorMeta}>
                <Star aria-hidden size={14} />
                {competitor.averageRating.toFixed(1)} {copy.ratingLabel} ·{" "}
                {competitor.reviewCount.toLocaleString("en-CA")} {copy.reviewsLabel}
              </p>
            </div>
            <div className={styles.competitorPosition}>
              <p className={styles.competitorPositionValue}>#{competitor.averageMapPosition.toFixed(1)}</p>
              <p className={styles.competitorPositionLabel}>{copy.positionLabel}</p>
            </div>
            <span className={styles.competitorFlag} data-ahead={competitor.outranksYou}>
              {competitor.outranksYou ? copy.outranks : copy.behind}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContentPlan({ detail, copy }: { detail: Detail; copy: Props["copy"]["content"] }) {
  if (detail.contentPlan.length === 0) return <p className={styles.empty}>{copy.empty}</p>;

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{copy.heading}</h2>
      <p className={styles.panelNote}>{copy.note}</p>
      <ul className={styles.contentList}>
        {detail.contentPlan.map((piece) => (
          <li key={piece.contentTypeId} className={styles.contentItem}>
            <div>
              <p className={styles.contentName}>{piece.name}</p>
              <p className={styles.contentMeta}>
                {piece.channel} · {piece.estimatedMinutes} {copy.minutesSuffix}
              </p>
            </div>
            <Link href="/content" className={styles.contentCta}>
              {copy.create}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tasks({
  detail,
  copy,
  effortCopy,
  action,
}: {
  detail: Detail;
  copy: Props["copy"]["tasks"];
  effortCopy: Props["copy"]["recommendation"]["effort"];
  action: (formData: FormData) => void;
}) {
  const done = detail.actions.filter((task) => task.done).length;
  const total = detail.actions.length;

  return (
    <section className={styles.panel}>
      <div className={styles.tasksHead}>
        <h2 className={styles.panelTitle}>{copy.heading}</h2>
        <p className={styles.tasksCount}>
          {done} {copy.done} · {total - done} {copy.remaining}
        </p>
      </div>

      <ul className={styles.taskList}>
        {detail.actions.map((task) => (
          <li key={task.id} className={styles.task} data-done={task.done}>
            <form action={action} className={styles.taskForm}>
              <input type="hidden" name="opportunityId" value={detail.id} />
              <input type="hidden" name="actionId" value={task.id} />
              <input type="hidden" name="done" value={task.done ? "false" : "true"} />
              <button type="submit" className={styles.taskToggle} aria-pressed={task.done}>
                <span className={styles.checkbox} aria-hidden>
                  {task.done && <Check size={15} />}
                </span>
                <span className={styles.taskLabel}>{task.label}</span>
              </button>
            </form>
            <span className={styles.effort} data-effort={task.effort}>
              {effortCopy[task.effort]}
            </span>
          </li>
        ))}
      </ul>

      {done === total && total > 0 && <p className={styles.allDone}>{copy.allDone}</p>}
    </section>
  );
}
