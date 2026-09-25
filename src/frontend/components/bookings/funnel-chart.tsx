// The search-to-booking funnel.
//
// Only the three count stages are drawn: they share one scale, so their heights are comparable. Revenue is
// a different unit and gets its own figure beside the chart — putting it on this axis would invite a
// comparison that means nothing. A table view carries the same numbers for anyone who cannot read the bars.
import type { BookingsCopy } from "@/frontend/copy/bookings";
import type { FunnelStage } from "@/shared/types/booking";
import styles from "./funnel-chart.module.css";

/** Ordinal rose ramp, light to dark, validated against a white surface. */
const STEPS = ["#e88aa9", "#d4557a", "#a5325a"];

export function FunnelChart({
  stages,
  revenue,
  copy,
}: {
  stages: readonly FunnelStage[];
  revenue: FunnelStage | null;
  copy: BookingsCopy["funnel"];
}) {
  const max = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <section className={styles.card} aria-labelledby="funnel-heading">
      <h2 id="funnel-heading" className={styles.heading}>
        {copy.heading}
      </h2>

      <div className={styles.layout}>
        <div className={styles.plot}>
          <ul className={styles.bars}>
            {stages.map((stage, index) => {
              const previous = index === 0 ? null : stages[index - 1]!.value;
              const share = previous && previous > 0 ? Math.round((stage.value / previous) * 100) : null;
              return (
                <li key={stage.id} className={styles.barSlot}>
                  <p className={styles.barValue}>{stage.value.toLocaleString("en-CA")}</p>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${Math.max(3, Math.round((stage.value / max) * 100))}%`,
                        background: STEPS[index] ?? STEPS[STEPS.length - 1],
                      }}
                    >
                      <span className={styles.tooltip} role="presentation">
                        {stage.label}: {stage.value.toLocaleString("en-CA")}
                        {share !== null && ` · ${share}% ${copy.dropLabel}`}
                      </span>
                    </div>
                  </div>
                  <p className={styles.barLabel}>{stage.label}</p>
                </li>
              );
            })}
          </ul>
          <div className={styles.baseline} aria-hidden />
        </div>

        {revenue && (
          <aside className={styles.revenue}>
            <p className={styles.revenueLabel}>{copy.revenueLabel}</p>
            <p className={styles.revenueValue}>${revenue.value.toLocaleString("en-CA")}</p>
            <p className={styles.revenueHint}>{copy.revenueHint}</p>
          </aside>
        )}
      </div>

      <p className={styles.note}>{copy.note}</p>

      <details className={styles.table}>
        <summary className={styles.tableToggle}>{copy.tableToggle}</summary>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th scope="col">{copy.tableStage}</th>
              <th scope="col">{copy.tableValue}</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.id}>
                <th scope="row">{stage.label}</th>
                <td>{stage.value.toLocaleString("en-CA")}</td>
              </tr>
            ))}
            {revenue && (
              <tr>
                <th scope="row">{revenue.label}</th>
                <td>${revenue.value.toLocaleString("en-CA")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </details>
    </section>
  );
}
