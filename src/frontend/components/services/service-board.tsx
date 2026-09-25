"use client";
// Services: under-marketed services with evidence and a checklist, then every service with editable
// economics. Edits save after a short pause and the whole board comes back re-scored.
import { AlertTriangle, Check, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveEconomicsAction } from "@/app/(app)/services/actions";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import type { ServicesCopy } from "@/frontend/copy/services";
import type { ServiceBoard as Board, ServiceInsight } from "@/shared/types/service-intelligence";
import styles from "@/frontend/components/app/data.module.css";
import local from "./service-board.module.css";

type Props = { initial: Board; copy: ServicesCopy };

const SAVE_DELAY_MS = 600;

export function ServiceBoard({ initial, copy }: Props) {
  const [board, setBoard] = useState(initial);

  if (board.services.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState
          icon={<Layers aria-hidden size={26} />}
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
  const underMarketed = board.services.filter((service) => service.isUnderMarketed);

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

      <Panel title={copy.underMarketed.heading}>
        <p className={styles.intro}>{copy.underMarketed.intro}</p>
        {underMarketed.length === 0 ? (
          <p className={styles.muted}>{copy.underMarketed.empty}</p>
        ) : (
          <div className={local.cards}>
            {underMarketed.map((service) => (
              <UnderMarketedCard key={service.serviceSlug} service={service} copy={copy} />
            ))}
          </div>
        )}
      </Panel>

      <Panel title={copy.table.heading}>
        <p className={styles.intro}>{copy.table.intro}</p>
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: 1040 }}>
            <caption>{copy.table.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{copy.table.service}</th>
                <th scope="col">{copy.table.demand}</th>
                <th scope="col">{copy.table.competition}</th>
                <th scope="col" className={styles.num}>
                  {copy.table.rank}
                </th>
                <th scope="col">{copy.table.price}</th>
                <th scope="col">{copy.table.duration}</th>
                <th scope="col">{copy.table.margin}</th>
                <th scope="col" className={styles.num}>
                  {copy.table.profit}
                </th>
                <th scope="col">{copy.table.score}</th>
              </tr>
            </thead>
            <tbody>
              {board.services.map((service) => (
                <ServiceRow key={service.serviceSlug} service={service} copy={copy} onSaved={setBoard} />
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>{copy.profitNote}</p>
      </Panel>

      <p className={styles.note}>{copy.simulatedNote}</p>
    </div>
  );
}

function evidenceText(service: ServiceInsight, code: ServiceInsight["evidence"][number], copy: ServicesCopy): string {
  const count = code === "few-reviews" ? service.reviewCount : service.competitorsAhead;
  return copy.evidence[code].replace("{count}", String(count));
}

function UnderMarketedCard({ service, copy }: { service: ServiceInsight; copy: ServicesCopy }) {
  return (
    <article className={local.card}>
      <header className={local.cardHead}>
        <h3 className={local.cardTitle}>
          <AlertTriangle aria-hidden size={16} />
          {service.serviceName}
        </h3>
        <span className={styles.chip}>
          {(service.monthlySearches ?? 0).toLocaleString("en-CA")} {copy.table.searches}
        </span>
      </header>
      <p className={local.subhead}>{copy.underMarketed.evidenceHeading}</p>
      <ul className={local.bullets}>
        {service.evidence.map((code) => (
          <li key={code}>{evidenceText(service, code, copy)}</li>
        ))}
      </ul>
      <p className={local.subhead}>{copy.underMarketed.checklistHeading}</p>
      <ol className={local.steps}>
        {service.evidence.map((code) => (
          <li key={code}>{copy.checklist[code]}</li>
        ))}
      </ol>
    </article>
  );
}

type Draft = { averagePrice: string; durationMinutes: string; marginPercent: string };

function ServiceRow({
  service,
  copy,
  onSaved,
}: {
  service: ServiceInsight;
  copy: ServicesCopy;
  onSaved: (board: Board) => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    averagePrice: String(service.economics.averagePrice),
    durationMinutes: String(service.economics.durationMinutes),
    marginPercent: String(service.economics.marginPercent),
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | string>("idle");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      setStatus("saving");
      const result = await saveEconomicsAction({ serviceSlug: service.serviceSlug, ...draft });
      if (result.board) {
        onSaved(result.board);
        setStatus("saved");
      } else {
        setStatus(result.error);
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // Saving is driven by the draft only; the slug and callback are stable for the row's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const field = (key: keyof Draft, label: string, step: string) => (
    <td>
      <input
        className={`${styles.input} ${local.numberInput}`}
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={draft[key]}
        aria-label={`${label} — ${service.serviceName}`}
        onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
      />
    </td>
  );

  const offering = copy.table.offering
    .replace("{count}", String(service.competitorsOffering))
    .replace("{total}", String(service.totalCompetitors));

  return (
    <tr>
      <th scope="row">
        {service.serviceName}
        {service.isUnderMarketed && (
          <span className={styles.sub}>
            <span className={styles.chip} data-tone="warn">
              {copy.underMarketed.badge}
            </span>
          </span>
        )}
        <span className={styles.sub} role="status">
          {status === "saving" ? (
            copy.table.saving
          ) : status === "saved" ? (
            <span className={local.saved}>
              <Check aria-hidden size={12} /> {copy.table.saved}
            </span>
          ) : status !== "idle" ? (
            <span className={local.error}>{status}</span>
          ) : !service.economics.isOwnerEntered ? (
            copy.table.estimated
          ) : null}
        </span>
      </th>
      <td>
        <span
          className={styles.chip}
          data-tone={service.demand === "high" ? "good" : service.demand === "low" ? "bad" : undefined}
        >
          {copy.levels[service.demand]}
        </span>
        <span className={styles.sub}>
          {service.monthlySearches === null ? "—" : service.monthlySearches.toLocaleString("en-CA")}{" "}
          {copy.table.searches}
        </span>
      </td>
      <td>
        <span
          className={styles.chip}
          data-tone={service.competition === "high" ? "bad" : service.competition === "low" ? "good" : undefined}
        >
          {copy.levels[service.competition]}
        </span>
        <span className={styles.sub}>{offering}</span>
      </td>
      <td className={styles.num}>
        {service.organicPosition === null ? copy.table.notRanking : `#${service.organicPosition}`}
      </td>
      {field("averagePrice", copy.table.price, "1")}
      {field("durationMinutes", copy.table.duration, "5")}
      {field("marginPercent", copy.table.margin, "1")}
      <td className={styles.num}>
        {service.estimatedMonthlyProfit
          ? `$${service.estimatedMonthlyProfit.low.toLocaleString("en-CA")}–$${service.estimatedMonthlyProfit.high.toLocaleString("en-CA")}`
          : "—"}
      </td>
      <td>
        <span className={local.score}>
          <strong>{service.opportunityScore}</strong>
          <span className={styles.meter} aria-hidden>
            <span className={styles.meterFill} style={{ width: `${service.opportunityScore}%` }} />
          </span>
        </span>
      </td>
    </tr>
  );
}
