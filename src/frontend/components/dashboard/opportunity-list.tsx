// The ranked list of what to do next. It arrives last, so it shows placeholder rows rather than an empty gap.
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { DashboardCopy } from "@/frontend/copy/dashboard";
import type { Opportunity } from "@/shared/types/opportunity";
import styles from "./opportunity-list.module.css";

type OpportunityListProps = {
  copy: DashboardCopy["opportunities"];
  opportunities: readonly Opportunity[];
  isPending: boolean;
};

const PLACEHOLDER_ROWS = [1, 2, 3, 4, 5];

export function OpportunityList({ copy, opportunities, isPending }: OpportunityListProps) {
  return (
    <section className={styles.section} aria-labelledby="opportunities-heading">
      <div className={styles.head}>
        <h2 id="opportunities-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        {opportunities.length > 0 && (
          <Link href="/opportunities" className={styles.viewAll}>
            {copy.viewAll}
          </Link>
        )}
      </div>

      {opportunities.length > 0 ? (
        <ol className={styles.list}>
          {opportunities.map((opportunity) => (
            <li key={opportunity.id} className={styles.item}>
              <span className={styles.rank} data-impact={opportunity.impact}>
                {opportunity.rank}
              </span>
              <div className={styles.body}>
                <Link href={`/opportunities/${opportunity.id}`} className={styles.title}>
                  {opportunity.title}
                </Link>
                <p className={styles.note}>{opportunity.note}</p>
                {opportunity.estimatedMonthlyBookings && (
                  <p className={styles.estimate}>
                    {copy.estimatePrefix} {opportunity.estimatedMonthlyBookings.low}–
                    {opportunity.estimatedMonthlyBookings.high} {copy.estimateSuffix}
                  </p>
                )}
              </div>
              <span className={styles.impact} data-impact={opportunity.impact}>
                {copy.impact[opportunity.impact]}
              </span>
            </li>
          ))}
        </ol>
      ) : isPending ? (
        <div aria-busy>
          <p className={styles.pendingHead}>
            <LoaderCircle aria-hidden size={18} className={styles.spinner} />
            {copy.pending}
          </p>
          <p className={styles.pendingNote}>{copy.pendingNote}</p>
          <ul className={styles.list}>
            {PLACEHOLDER_ROWS.map((row) => (
              <li key={row} className={styles.item}>
                <span className={styles.rankPending}>{row}</span>
                <div className={styles.body}>
                  <span className={`${styles.bar} ${styles.barTitle}`} aria-hidden />
                  <span className={`${styles.bar} ${styles.barNote}`} aria-hidden />
                </div>
                <span className={`${styles.bar} ${styles.barBadge}`} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.empty}>{copy.empty}</p>
      )}
    </section>
  );
}
