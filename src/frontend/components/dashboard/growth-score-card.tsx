// The headline score. While the scan runs it shows real progress instead of a number, because a partial
// Growth Score would be misleading — the sub-score tiles below carry what has actually landed.
import { LoaderCircle, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import type { DashboardCopy } from "@/frontend/copy/dashboard";
import type { ScanProgress } from "@/shared/types/dashboard";
import type { GrowthScore } from "@/shared/types/score";
import { fillCount } from "./fill-count";
import styles from "./growth-score-card.module.css";

type GrowthScoreCardProps = {
  copy: DashboardCopy["growth"];
  score: GrowthScore | null;
  scan: ScanProgress;
  signalsDone: number;
  signalsTotal: number;
};

export function GrowthScoreCard({ copy, score, scan, signalsDone, signalsTotal }: GrowthScoreCardProps) {
  if (score) {
    return (
      <section className={styles.card} aria-labelledby="growth-heading">
        <div className={styles.text}>
          <h2 id="growth-heading" className={styles.title}>
            {copy.title}
          </h2>
          <p className={styles.value}>
            <span className={styles.number}>{score.value}</span>
            <span className={styles.outOf}>{copy.outOf}</span>
          </p>
        </div>

        <div className={styles.delta}>
          {score.deltaVsPrevious === null ? (
            <p className={styles.noPrevious}>{copy.noPrevious}</p>
          ) : (
            <>
              <p
                className={score.deltaVsPrevious >= 0 ? styles.deltaUp : styles.deltaDown}
                data-direction={score.deltaVsPrevious >= 0 ? "up" : "down"}
              >
                {score.deltaVsPrevious >= 0 ? (
                  <TrendingUp aria-hidden size={20} />
                ) : (
                  <TrendingDown aria-hidden size={20} />
                )}
                {score.deltaVsPrevious >= 0 ? "+" : ""}
                {score.deltaVsPrevious}
              </p>
              <p className={styles.deltaNote}>{copy.deltaSuffix}</p>
            </>
          )}
        </div>

        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${score.value}%` }} />
        </div>
      </section>
    );
  }

  const failed = scan.status === "failed";

  return (
    <section className={`${styles.card} ${styles.pendingCard}`} aria-labelledby="growth-heading" aria-busy={!failed}>
      <div className={styles.text}>
        <h2 id="growth-heading" className={styles.title}>
          {copy.title}
        </h2>
        <p className={styles.pendingHead}>
          {failed ? <TriangleAlert aria-hidden size={22} /> : <LoaderCircle aria-hidden size={22} className={styles.spinner} />}
          {failed ? copy.failed : copy.calculating}
        </p>
        <p className={styles.pendingNote}>{failed ? "" : copy.calculatingNote}</p>
      </div>

      {!failed && (
        <div className={styles.delta}>
          <p className={styles.signals}>{fillCount(copy.signalsIn, signalsDone, signalsTotal)}</p>
          <p className={styles.deltaNote}>{scan.percentComplete}%</p>
        </div>
      )}

      <div className={styles.track}>
        <div
          className={failed ? styles.fillFailed : styles.fillPending}
          style={{ width: `${Math.max(4, scan.percentComplete)}%` }}
        />
      </div>
    </section>
  );
}
