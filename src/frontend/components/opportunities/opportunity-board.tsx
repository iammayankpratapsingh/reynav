"use client";
// The ranked list of opportunities from the latest scan, with sort and filter controls above it.
import Link from "next/link";
import { ArrowRight, Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import type { OpportunitiesCopy } from "@/frontend/copy/opportunities";
import {
  DIFFICULTIES,
  type Difficulty,
  type OpportunityBoard as Board,
  type OpportunityDetail,
} from "@/shared/types/opportunity";
import styles from "./opportunity-board.module.css";

type SortKey = "rank" | "revenue" | "difficulty" | "searches";

const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
const ALL = "all";
/** Filter value for opportunities that are not about one service (reviews, website conversion). */
const NO_SERVICE = "none";

const sorters: Record<SortKey, (a: OpportunityDetail, b: OpportunityDetail) => number> = {
  rank: (a, b) => a.rank - b.rank,
  revenue: (a, b) =>
    (b.estimatedMonthlyRevenue?.high ?? -1) - (a.estimatedMonthlyRevenue?.high ?? -1) || a.rank - b.rank,
  difficulty: (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] || a.rank - b.rank,
  searches: (a, b) => (b.monthlySearches ?? -1) - (a.monthlySearches ?? -1) || a.rank - b.rank,
};

export function OpportunityBoard({ board, copy }: { board: Board; copy: OpportunitiesCopy["list"] }) {
  const [sort, setSort] = useState<SortKey>("rank");
  const [service, setService] = useState(ALL);
  const [difficulty, setDifficulty] = useState<Difficulty | typeof ALL>(ALL);
  const [location, setLocation] = useState(ALL);

  const services = useMemo(() => {
    const byslug = new Map<string, string>();
    for (const opportunity of board.opportunities) {
      if (opportunity.serviceSlug) byslug.set(opportunity.serviceSlug, opportunity.title);
    }
    return [...byslug.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [board.opportunities]);

  const locations = useMemo(
    () => [...new Set(board.opportunities.map((opportunity) => opportunity.locationLabel).filter(Boolean))].sort(),
    [board.opportunities],
  );

  const visible = useMemo(
    () =>
      board.opportunities
        .filter((opportunity) =>
          service === ALL
            ? true
            : service === NO_SERVICE
              ? !opportunity.serviceSlug
              : opportunity.serviceSlug === service,
        )
        .filter((opportunity) => difficulty === ALL || opportunity.difficulty === difficulty)
        .filter((opportunity) => location === ALL || opportunity.locationLabel === location)
        .sort(sorters[sort]),
    [board.opportunities, service, difficulty, location, sort],
  );

  const isFiltered = sort !== "rank" || service !== ALL || difficulty !== ALL || location !== ALL;
  const reset = () => {
    setSort("rank");
    setService(ALL);
    setDifficulty(ALL);
    setLocation(ALL);
  };

  if (board.opportunities.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState
          icon={<TrendingUp aria-hidden size={26} />}
          heading={copy.empty.heading}
          body={copy.empty.body}
          cta={copy.empty.cta}
        />
      </div>
    );
  }

  const scannedAt = board.scannedAt
    ? new Date(board.scannedAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        action={
          scannedAt ? (
            <p className={styles.scanned}>
              {copy.scannedPrefix} {scannedAt}
            </p>
          ) : undefined
        }
      />

      <div className={styles.controls} role="group" aria-label={copy.controls.label}>
        <label className={styles.control}>
          <span>{copy.controls.sort}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            {(Object.keys(copy.controls.sortOptions) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {copy.controls.sortOptions[key]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.control}>
          <span>{copy.controls.service}</span>
          <select value={service} onChange={(event) => setService(event.target.value)}>
            <option value={ALL}>{copy.controls.all}</option>
            {services.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
            <option value={NO_SERVICE}>{copy.controls.other}</option>
          </select>
        </label>
        <label className={styles.control}>
          <span>{copy.controls.difficulty}</span>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | typeof ALL)}>
            <option value={ALL}>{copy.controls.all}</option>
            {DIFFICULTIES.map((level) => (
              <option key={level} value={level}>
                {copy.difficulty[level]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.control}>
          <span>{copy.controls.location}</span>
          <select value={location} onChange={(event) => setLocation(event.target.value)}>
            <option value={ALL}>{copy.controls.all}</option>
            {locations.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.count} aria-live="polite">
          {copy.controls.count
            .replace("{shown}", String(visible.length))
            .replace("{total}", String(board.opportunities.length))}
        </p>
        {isFiltered && (
          <button type="button" className={styles.reset} onClick={reset}>
            {copy.controls.reset}
          </button>
        )}
      </div>

      {visible.length === 0 && <p className={styles.noMatch}>{copy.controls.noMatch}</p>}

      <ol className={styles.list}>
        {visible.map((opportunity) => (
          <li key={opportunity.id} className={styles.item}>
            <Link href={`/opportunities/${opportunity.id}`} className={styles.link}>
              <span className={styles.rank} data-impact={opportunity.impact}>
                {opportunity.rank}
              </span>

              <span className={styles.body}>
                <span className={styles.title}>{opportunity.title}</span>
                <span className={styles.note}>{opportunity.note}</span>

                <span className={styles.facts}>
                  {opportunity.monthlySearches !== null && (
                    <span className={styles.fact}>
                      <Search aria-hidden size={14} />
                      {opportunity.monthlySearches.toLocaleString("en-CA")} {copy.searchesLabel}
                    </span>
                  )}
                  <span className={styles.fact}>
                    {copy.rankLabel}{" "}
                    <strong>
                      {opportunity.yourPosition === null ? copy.unranked : `#${opportunity.yourPosition}`}
                    </strong>
                  </span>
                  {opportunity.estimatedMonthlyRevenue && (
                    <span className={styles.fact}>
                      <strong>
                        ${opportunity.estimatedMonthlyRevenue.low.toLocaleString("en-CA")}–$
                        {opportunity.estimatedMonthlyRevenue.high.toLocaleString("en-CA")}
                      </strong>{" "}
                      {copy.revenueLabel}
                    </span>
                  )}
                  <span className={styles.fact}>
                    <span className={styles.difficulty} data-difficulty={opportunity.difficulty}>
                      {copy.difficulty[opportunity.difficulty]}
                    </span>
                  </span>
                  {opportunity.locationLabel && <span className={styles.fact}>{opportunity.locationLabel}</span>}
                  {opportunity.estimatedMonthlyBookings && (
                    <span className={styles.fact}>
                      <strong>
                        {opportunity.estimatedMonthlyBookings.low}–{opportunity.estimatedMonthlyBookings.high}
                      </strong>{" "}
                      {copy.bookingsLabel}
                    </span>
                  )}
                </span>
              </span>

              <span className={styles.side}>
                <span className={styles.impact} data-impact={opportunity.impact}>
                  {copy.impact[opportunity.impact]}
                </span>
                <span className={styles.open}>
                  {copy.open}
                  <ArrowRight aria-hidden size={16} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
