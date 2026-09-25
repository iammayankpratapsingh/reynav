// Reports: one card per completed scan.
import { Download, FileText, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import type { ReportsCopy } from "@/frontend/copy/reports";
import type { ReportBoard as Board } from "@/shared/types/report";
import styles from "./report-board.module.css";

export function ReportBoard({ board, copy }: { board: Board; copy: ReportsCopy }) {
  if (board.reports.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState
          icon={<FileText aria-hidden size={26} />}
          heading={copy.empty.heading}
          body={copy.empty.body}
          cta={copy.empty.cta}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <p className={styles.derived}>{copy.derivedNote}</p>

      <ul className={styles.list}>
        {board.reports.map((report) => (
          <li key={report.id} className={styles.card}>
            <header className={styles.head}>
              <div>
                <p className={styles.period}>{report.periodLabel}</p>
                <p className={styles.generated}>
                  {copy.report.generatedPrefix}{" "}
                  {new Date(report.generatedAt).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className={styles.score}>
                <p className={styles.scoreValue}>
                  {report.growthScore ?? "—"}
                  <span className={styles.outOf}>{copy.report.outOf}</span>
                </p>
                {report.growthDelta === null ? (
                  <p className={styles.firstReport}>{copy.report.firstReport}</p>
                ) : (
                  <p className={styles.delta} data-direction={report.growthDelta >= 0 ? "up" : "down"}>
                    {report.growthDelta >= 0 ? (
                      <TrendingUp aria-hidden size={14} />
                    ) : (
                      <TrendingDown aria-hidden size={14} />
                    )}
                    {report.growthDelta >= 0 ? "+" : ""}
                    {report.growthDelta} {copy.report.sinceLast}
                  </p>
                )}
              </div>
            </header>

            <div className={styles.body}>
              <section>
                <h3 className={styles.sectionHeading}>{copy.report.highlightsHeading}</h3>
                <ul className={styles.highlights}>
                  {report.highlights.map((highlight) => (
                    <li key={highlight.label} className={styles.highlight}>
                      <span className={styles.highlightLabel}>{highlight.label}</span>
                      <span className={styles.highlightValue}>{highlight.value}</span>
                      <span className={styles.highlightDelta} data-direction={directionOf(highlight.delta)}>
                        {highlight.delta === null ? (
                          "—"
                        ) : highlight.delta === 0 ? (
                          <Minus aria-hidden size={12} />
                        ) : (
                          <>
                            {highlight.delta > 0 ? "+" : ""}
                            {highlight.delta}
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className={styles.sectionHeading}>{copy.report.opportunitiesHeading}</h3>
                <ol className={styles.opportunities}>
                  {report.topOpportunities.map((title, index) => (
                    <li key={title}>
                      <span className={styles.opportunityRank}>{index + 1}</span>
                      {title}
                    </li>
                  ))}
                </ol>
                {report.estimatedMonthlyBookings && (
                  <p className={styles.estimate}>
                    {copy.report.estimatePrefix} {report.estimatedMonthlyBookings.low}–
                    {report.estimatedMonthlyBookings.high} {copy.report.estimateSuffix}
                  </p>
                )}
              </section>
            </div>

            <footer className={styles.foot}>
              <button type="button" className={styles.download} disabled>
                <Download aria-hidden size={17} />
                {copy.report.download}
              </button>
              <span className={styles.notWired}>{copy.report.notWired}</span>
            </footer>
          </li>
        ))}
      </ul>
    </div>
  );
}

function directionOf(delta: number | null): string {
  if (delta === null) return "none";
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}
