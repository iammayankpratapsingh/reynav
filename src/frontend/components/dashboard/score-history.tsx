"use client";
// Growth Score over time: one line, one point per completed scan. Hovering or focusing a point shows its
// value; the latest point is labelled directly; a hidden table carries the same numbers for screen readers.
import { useState } from "react";
import type { DashboardCopy } from "@/frontend/copy/dashboard";
import type { ScoreHistoryPoint } from "@/shared/types/dashboard";
import styles from "./score-history.module.css";

type ScoreHistoryProps = {
  copy: DashboardCopy["history"];
  points: readonly ScoreHistoryPoint[];
};

const WIDTH = 560;
const HEIGHT = 200;
const PAD = { top: 18, right: 40, bottom: 28, left: 32 };
const GRID_STEPS = 4;

function formatDate(iso: string, withYear = false): string {
  return new Date(iso).toLocaleDateString(
    "en-CA",
    withYear ? { month: "short", day: "numeric", year: "numeric" } : { month: "short" },
  );
}

export function ScoreHistory({ copy, points }: ScoreHistoryProps) {
  const [active, setActive] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <section className={styles.card} aria-labelledby="history-heading">
        <h2 id="history-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.empty}>{copy.empty}</p>
      </section>
    );
  }

  const values = points.map((point) => point.growth);
  // A y-range that hugs the data, rounded to tens, so movement is visible without exaggerating it.
  const min = Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10);
  const max = Math.min(100, Math.ceil((Math.max(...values) + 5) / 10) * 10);
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (index / (points.length - 1)) * plotW;
  const y = (value: number) => PAD.top + (1 - (value - min) / (max - min)) * plotH;

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.growth)}`).join(" ");
  const grid = Array.from({ length: GRID_STEPS + 1 }, (_, step) => min + ((max - min) / GRID_STEPS) * step);
  const last = points.length - 1;
  const hovered = active === null ? null : points[active];

  return (
    <section className={styles.card} aria-labelledby="history-heading">
      <h2 id="history-heading" className={styles.heading}>
        {copy.heading}
      </h2>

      <div className={styles.chart}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.svg} role="img" aria-labelledby="history-heading">
          {grid.map((value) => (
            <g key={value}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(value)} y2={y(value)} className={styles.grid} />
              <text
                x={PAD.left - 8}
                y={y(value)}
                className={styles.axisLabel}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {Math.round(value)}
              </text>
            </g>
          ))}

          {points.map((point, index) => (
            <text key={point.scanId} x={x(index)} y={HEIGHT - 8} className={styles.axisLabel} textAnchor="middle">
              {formatDate(point.at)}
            </text>
          ))}

          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} className={styles.crosshair} />
          )}

          <path d={path} className={styles.line} />

          {points.map((point, index) => (
            <circle
              key={point.scanId}
              cx={x(index)}
              cy={y(point.growth)}
              r={active === index || index === last ? 5 : 4}
              className={styles.point}
            />
          ))}

          <text x={x(last) + 10} y={y(points[last]!.growth)} className={styles.directLabel} dominantBaseline="middle">
            {points[last]!.growth}
          </text>

          {/* Hit targets wider than the marks: one column per point. */}
          {points.map((point, index) => (
            <rect
              key={point.scanId}
              x={x(index) - plotW / (points.length - 1) / 2}
              y={PAD.top}
              width={plotW / (points.length - 1)}
              height={plotH}
              className={styles.hit}
              tabIndex={0}
              aria-label={copy.pointLabel
                .replace("{score}", String(point.growth))
                .replace("{date}", formatDate(point.at, true))}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            />
          ))}
        </svg>

        {hovered && active !== null && (
          <div
            className={styles.tooltip}
            style={{ left: `${(x(active) / WIDTH) * 100}%`, top: `${(y(hovered.growth) / HEIGHT) * 100}%` }}
            aria-hidden
          >
            <strong>{hovered.growth}</strong>
            <span>{formatDate(hovered.at, true)}</span>
          </div>
        )}
      </div>

      <table className={styles.srOnly}>
        <caption>{copy.heading}</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.scanId}>
              <th scope="row">{formatDate(point.at, true)}</th>
              <td>{point.growth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
