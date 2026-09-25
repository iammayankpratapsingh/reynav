// The six parts of the Growth Score. Each tile fills in the moment its step finishes, so the row is
// never blocked on the slowest signal.
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardCopy } from "@/frontend/copy/dashboard";
import { SUB_SCORE_KEYS, type SubScore, type SubScoreKey } from "@/shared/types/score";
import styles from "./sub-score-tiles.module.css";

type SubScoreTilesProps = {
  copy: DashboardCopy["subScores"];
  subScores: readonly SubScore[];
};

export function SubScoreTiles({ copy, subScores }: SubScoreTilesProps) {
  const byKey = new Map(subScores.map((score) => [score.key, score]));

  return (
    <section aria-labelledby="sub-scores-heading">
      <h2 id="sub-scores-heading" className={styles.srOnly}>
        {copy.heading}
      </h2>
      <ul className={styles.row}>
        {SUB_SCORE_KEYS.map((key: SubScoreKey) => {
          const score = byKey.get(key);
          return (
            <li key={key} className={styles.tile} data-key={key} aria-busy={score ? undefined : true}>
              <p className={styles.label}>{copy.labels[key]}</p>
              {score ? (
                <>
                  <p className={styles.value}>
                    <span className={styles.number}>{score.value}</span>
                    <span className={styles.outOf}>/100</span>
                  </p>
                  <Trend delta={score.previousValue === null ? null : score.value - score.previousValue} copy={copy} />
                </>
              ) : (
                <p className={styles.pending}>
                  <span className={styles.bar} aria-hidden />
                  <span className={styles.pendingLabel}>{copy.pending}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Movement since the previous scan. Direction is carried by the icon and the sign, never by colour alone. */
function Trend({ delta, copy }: { delta: number | null; copy: DashboardCopy["subScores"] }) {
  if (delta === null) return <p className={styles.trend}>{copy.firstScan}</p>;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  return (
    <p className={styles.trend} data-direction={direction}>
      <Icon aria-hidden size={14} strokeWidth={2.5} />
      {delta > 0 ? "+" : ""}
      {delta} <span className={styles.trendNote}>{copy.vsLast}</span>
    </p>
  );
}
