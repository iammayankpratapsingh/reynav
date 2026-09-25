// Bookings: the headline counts, the funnel, and which booking platforms are linked.
import { CalendarCheck, Globe, Minus, MousePointerClick, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import { StatTile } from "@/frontend/components/app/stat-tile";
import { Thumb } from "@/frontend/components/app/thumb";
import type { BookingsCopy } from "@/frontend/copy/bookings";
import type { BeforeAfter, BookingPerformance as Performance } from "@/shared/types/booking";
import shared from "@/frontend/components/app/data.module.css";
import styles from "./booking-performance.module.css";
import { FunnelChart } from "./funnel-chart";

export function BookingPerformance({ data, copy }: { data: Performance; copy: BookingsCopy }) {
  const counts = data.stages.filter((stage) => stage.format === "count");
  const revenue = data.stages.find((stage) => stage.format === "currency") ?? null;
  const [visits, bookingPage, bookings] = counts;

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        action={<p className={styles.period}>{data.periodLabel}</p>}
      />

      <div className={styles.stats}>
        <StatTile
          value={(visits?.value ?? 0).toLocaleString("en-CA")}
          label={copy.stats.visits}
          icon={<Globe aria-hidden size={19} />}
        />
        <StatTile
          value={(bookingPage?.value ?? 0).toLocaleString("en-CA")}
          label={copy.stats.bookingPage}
          icon={<MousePointerClick aria-hidden size={19} />}
        />
        <StatTile
          value={(bookings?.value ?? 0).toLocaleString("en-CA")}
          label={copy.stats.bookings}
          tone="brand"
          icon={<CalendarCheck aria-hidden size={19} />}
          hint={`${(data.conversionRate * 100).toFixed(1)}% ${copy.stats.conversionHint}`}
        />
        <StatTile
          value={`$${(revenue?.value ?? 0).toLocaleString("en-CA")}`}
          label={copy.stats.revenue}
          tone="positive"
          icon={<TrendingUp aria-hidden size={19} />}
        />
      </div>

      <FunnelChart stages={counts} revenue={revenue} copy={copy.funnel} />

      <div className={shared.grid2}>
        <Panel title={copy.services.heading}>
          <p className={shared.intro}>{copy.services.intro}</p>
          {data.serviceRevenue.length === 0 ? (
            <p className={shared.muted}>{copy.services.empty}</p>
          ) : (
            <ul className={shared.list}>
              {data.serviceRevenue.map((row) => (
                <li key={row.serviceName} className={styles.revenueRow}>
                  <span className={styles.revenueName}>
                    {row.serviceName}
                    <span className={shared.sub}>{copy.services.bookings.replace("{count}", String(row.bookings))}</span>
                  </span>
                  <span className={shared.meter} aria-hidden>
                    <span className={shared.meterFill} style={{ width: `${Math.round(row.share * 100)}%` }} />
                  </span>
                  <strong className={styles.revenueValue}>
                    ${row.revenue.toLocaleString("en-CA")}
                    <span className={shared.sub}>{Math.round(row.share * 100)}%</span>
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={copy.beforeAfter.heading}>
          {data.beforeAfter ? (
            <BeforeAfterView value={data.beforeAfter} copy={copy} />
          ) : (
            <p className={shared.muted}>{copy.beforeAfter.empty}</p>
          )}
        </Panel>
      </div>

      <Panel
        title={copy.integrations.heading}
        action={
          <button type="button" className={styles.add}>
            {copy.integrations.add}
          </button>
        }
      >
        <ul className={styles.integrations}>
          {data.integrations.map((integration) => (
            <li key={integration.id} className={styles.integration} data-active={integration.isActive}>
              <Thumb label={integration.name} size="sm" />
              <span className={styles.integrationName}>{integration.name}</span>
              {integration.status === "connected" ? (
                <span className={styles.connected}>{copy.integrations.connected}</span>
              ) : (
                <button type="button" className={styles.connect}>
                  {copy.integrations.connect}
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className={styles.note}>{copy.integrations.note}</p>
      </Panel>

      <p className={styles.note}>
        {copy.estimateNote} {copy.source[data.dataSource]}
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00.000Z`).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Change({ before, after, format }: { before: number; after: number; format: (value: number) => string }) {
  const delta = after - before;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const percent = before === 0 ? null : Math.round((delta / before) * 100);
  return (
    <span className={shared.delta} data-direction={direction}>
      <Icon aria-hidden size={13} />
      {delta > 0 ? "+" : delta < 0 ? "−" : ""}
      {format(Math.abs(delta))}
      {percent !== null && ` (${percent > 0 ? "+" : ""}${percent}%)`}
    </span>
  );
}

function BeforeAfterView({ value, copy }: { value: BeforeAfter; copy: BookingsCopy }) {
  const text = copy.beforeAfter;
  const money = (amount: number) => `$${Math.round(amount).toLocaleString("en-CA")}`;
  const count = (amount: number) => amount.toLocaleString("en-CA");
  const percent = (share: number) => `${Math.round(share * 100)}%`;
  const rows = [
    { label: text.bookings, before: value.before.bookings, after: value.after.bookings, format: count },
    { label: text.revenue, before: value.before.revenue, after: value.after.revenue, format: money },
    { label: text.averageValue, before: value.before.averageValue, after: value.after.averageValue, format: money },
    { label: text.onlineShare, before: value.before.onlineShare, after: value.after.onlineShare, format: percent },
  ];

  return (
    <>
      <p className={shared.intro}>{text.intro.replace("{date}", formatDate(value.splitOn))}</p>
      <div className={shared.tableWrap}>
        <table className={shared.table} style={{ minWidth: 420 }}>
          <caption>{text.heading}</caption>
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col" className={shared.num}>
                {text.before}
                <span className={shared.sub}>
                  {formatDate(value.before.from)} – {formatDate(value.before.to)}
                </span>
              </th>
              <th scope="col" className={shared.num}>
                {text.after}
                <span className={shared.sub}>
                  {formatDate(value.after.from)} – {formatDate(value.after.to)}
                </span>
              </th>
              <th scope="col" className={shared.num}>
                {text.change}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td className={shared.num}>{row.format(row.before)}</td>
                <td className={shared.num}>{row.format(row.after)}</td>
                <td className={shared.num}>
                  {row.label === text.onlineShare ? (
                    <span className={shared.delta} data-direction={row.after >= row.before ? "up" : "down"}>
                      {row.after >= row.before ? "+" : "−"}
                      {Math.abs(Math.round((row.after - row.before) * 100))} pts
                    </span>
                  ) : (
                    <Change before={row.before} after={row.after} format={row.format} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className={styles.subheading}>{text.byService}</h3>
      <ul className={shared.list}>
        {value.byService.map((row) => (
          <li key={row.serviceName} className={shared.listItem}>
            <p className={shared.listTitle}>{row.serviceName}</p>
            <Change before={row.beforeRevenue} after={row.afterRevenue} format={money} />
          </li>
        ))}
      </ul>
      <p className={shared.note}>{text.note}</p>
    </>
  );
}
