// AI Search: the sub-score, a line per surface, each question with each surface's answer, and the trend.
import { Bot, Check, Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import type { AiSearchCopy } from "@/frontend/copy/ai-search";
import { AI_SURFACES, type AiSearchBoard as Board, type AiServiceVisibility } from "@/shared/types/ai-search";
import styles from "@/frontend/components/app/data.module.css";
import local from "./ai-search-board.module.css";

export function AiSearchBoard({ board, copy }: { board: Board; copy: AiSearchCopy }) {
  if (!board.scanId) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState
          icon={<Bot aria-hidden size={26} />}
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
  const delta = board.score && board.score.previous !== null ? board.score.value - board.score.previous : null;

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        action={
          scannedAt ? (
            <p className={styles.meta}>
              {copy.scannedPrefix} {scannedAt}
            </p>
          ) : undefined
        }
      />

      <div className={local.summary}>
        {board.score && (
          <div className={local.tile}>
            <p className={local.tileLabel}>{copy.score.label}</p>
            <p className={local.tileValue}>
              {board.score.value}
              <span>{copy.score.outOf}</span>
            </p>
            <p className={local.tileNote}>
              {delta === null ? (
                copy.score.first
              ) : (
                <span className={styles.delta} data-direction={delta > 0 ? "up" : delta < 0 ? "down" : "flat"}>
                  {delta > 0 ? (
                    <TrendingUp aria-hidden size={13} />
                  ) : delta < 0 ? (
                    <TrendingDown aria-hidden size={13} />
                  ) : (
                    <Minus aria-hidden size={13} />
                  )}
                  {delta > 0 ? "+" : ""}
                  {delta} {copy.score.vsLast}
                </span>
              )}
            </p>
          </div>
        )}
        {board.bySurface.map((row) => (
          <div key={row.surface} className={local.tile}>
            <p className={local.tileLabel}>{copy.surfaces[row.surface]}</p>
            <p className={local.tileValue}>
              {row.total === 0 ? 0 : Math.round((row.mentioned / row.total) * 100)}
              <span>%</span>
            </p>
            <p className={local.tileNote}>
              {copy.surfaceLine.replace("{mentioned}", String(row.mentioned)).replace("{total}", String(row.total))}
            </p>
          </div>
        ))}
      </div>

      <Panel title={copy.table.heading}>
        <p className={styles.intro}>{copy.table.intro}</p>
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: 860 }}>
            <caption>{copy.table.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{copy.table.service}</th>
                <th scope="col">{copy.table.location}</th>
                {AI_SURFACES.map((surface) => (
                  <th key={surface} scope="col">
                    {copy.surfaces[surface]}
                  </th>
                ))}
                <th scope="col">{copy.table.trend}</th>
              </tr>
            </thead>
            <tbody>
              {board.services.map((row) => (
                <VisibilityRow key={row.key} row={row} copy={copy} />
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={copy.history.heading}>
        <p className={styles.intro}>{copy.history.intro}</p>
        <ol className={local.history}>
          {board.history.map((point) => (
            <li key={point.scanId} className={local.historyRow}>
              <span className={local.historyDate}>
                {new Date(point.at).toLocaleDateString("en-CA", { month: "short", year: "numeric" })}
              </span>
              <span className={styles.meter} aria-hidden>
                <span className={styles.meterFill} style={{ width: `${point.mentionRate}%` }} />
              </span>
              <strong>{point.mentionRate}%</strong>
            </li>
          ))}
        </ol>
      </Panel>

      <p className={styles.note}>{copy.simulatedNote}</p>
    </div>
  );
}

function VisibilityRow({ row, copy }: { row: AiServiceVisibility; copy: AiSearchCopy }) {
  const now = row.results.filter((result) => result.wasMentioned).length;
  const delta = row.previousMentions === null ? null : now - row.previousMentions;
  return (
    <tr>
      <th scope="row">
        {row.serviceName ?? copy.table.general}
        <span className={styles.sub}>“{row.prompt}”</span>
      </th>
      <td>{row.locationLabel}</td>
      {AI_SURFACES.map((surface) => {
        const result = row.results.find((candidate) => candidate.surface === surface);
        if (!result) return <td key={surface}>—</td>;
        return (
          <td key={surface}>
            <span className={styles.chip} data-tone={result.wasMentioned ? "good" : "bad"}>
              {result.wasMentioned ? <Check aria-hidden size={13} /> : <X aria-hidden size={13} />}
              {result.wasMentioned
                ? copy.table.mentioned
                    .replace("{position}", String(result.position ?? "?"))
                    .replace("{count}", String(result.namedCount))
                : copy.table.notMentioned}
            </span>
          </td>
        );
      })}
      <td>
        {delta === null ? (
          <span className={styles.muted}>{copy.table.firstCheck}</span>
        ) : (
          <span className={styles.delta} data-direction={delta > 0 ? "up" : delta < 0 ? "down" : "flat"}>
            {delta > 0 ? (
              <TrendingUp aria-hidden size={13} />
            ) : delta < 0 ? (
              <TrendingDown aria-hidden size={13} />
            ) : (
              <Minus aria-hidden size={13} />
            )}
            {copy.table.trendLine
              .replace("{now}", String(now))
              .replace("{total}", String(row.results.length))
              .replace("{before}", String(row.previousMentions))}
          </span>
        )}
      </td>
    </tr>
  );
}
