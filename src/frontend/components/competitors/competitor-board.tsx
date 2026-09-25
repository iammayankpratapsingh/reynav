// Competitors: what changed, a side-by-side table, map positions by service, and missing pages.
import { Camera, FileText, MessageSquare, TrendingDown, TrendingUp, Users } from "lucide-react";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import type { CompetitorsCopy } from "@/frontend/copy/competitors";
import type { CompetitorBoard as Board, CompetitorChange, CompetitorProfile } from "@/shared/types/competitor";
import styles from "@/frontend/components/app/data.module.css";

type Props = { board: Board; copy: CompetitorsCopy };

const CHANGE_ICONS = { reviews: MessageSquare, posts: FileText, photos: Camera } as const;

export function CompetitorBoard({ board, copy }: Props) {
  if (!board.you || board.competitors.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.title} />
        <EmptyState
          icon={<Users aria-hidden size={26} />}
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
  const rows = [board.you, ...board.competitors];

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle
          .replace("{count}", String(board.competitors.length))
          .replace("{location}", board.locationLabel)}
        action={
          scannedAt ? (
            <p className={styles.meta}>
              {copy.scannedPrefix} {scannedAt}
            </p>
          ) : undefined
        }
      />

      <Panel title={copy.changes.heading}>
        <p className={styles.intro}>{copy.changes.intro}</p>
        {board.changes.length === 0 ? (
          <p className={styles.muted}>{copy.changes.empty}</p>
        ) : (
          <ul className={styles.feed}>
            {board.changes.map((change) => (
              <ChangeLine key={change.id} change={change} copy={copy} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={copy.table.heading}>
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ minWidth: 900 }}>
            <caption>{copy.table.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{copy.table.business}</th>
                <th scope="col" className={styles.num}>
                  {copy.table.rating}
                </th>
                <th scope="col" className={styles.num}>
                  {copy.table.reviews}
                </th>
                <th scope="col" className={styles.num}>
                  {copy.table.reviewGrowth}
                </th>
                <th scope="col" className={styles.num}>
                  {copy.table.services}
                </th>
                <th scope="col" className={styles.num}>
                  {copy.table.pages}
                </th>
                <th scope="col" className={styles.num}>
                  {copy.table.posts}
                </th>
                <th scope="col" className={styles.num}>
                  {copy.table.photos}
                </th>
                <th scope="col" className={styles.num}>
                  {copy.table.mapPosition}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <ProfileRow key={row.name} row={row} copy={copy} />
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className={styles.grid2}>
        <Panel title={copy.maps.heading}>
          <p className={styles.intro}>{copy.maps.intro}</p>
          <MapComparison you={board.you} competitors={board.competitors} copy={copy} />
        </Panel>

        <Panel title={copy.pages.heading}>
          <p className={styles.intro}>{copy.pages.intro}</p>
          {board.missingPages.length === 0 ? (
            <p className={styles.muted}>{copy.pages.empty}</p>
          ) : (
            <ul className={styles.list}>
              {board.missingPages.map((page) => (
                <li key={page.topic} className={styles.listItem}>
                  <div>
                    <p className={styles.listTitle}>{page.topic}</p>
                    <p className={styles.listSub}>{page.competitorNames.join(", ")}</p>
                  </div>
                  <span className={styles.chip} data-tone="warn">
                    {copy.pages.competitorsCount.replace("{count}", String(page.competitorNames.length))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <p className={styles.note}>{copy.simulatedNote}</p>
    </div>
  );
}

function ChangeLine({ change, copy }: { change: CompetitorChange; copy: CompetitorsCopy }) {
  const Icon = CHANGE_ICONS[change.metric];
  const text = copy.changes[change.metric]
    .replace("{name}", change.competitorName)
    .replace("{theirs}", String(change.theirs))
    .replace("{yours}", String(change.yours));
  return (
    <li className={styles.feedItem}>
      <span className={styles.feedIcon}>
        <Icon aria-hidden size={16} />
      </span>
      <span>{text}</span>
    </li>
  );
}

function ProfileRow({ row, copy }: { row: CompetitorProfile; copy: CompetitorsCopy }) {
  const growth = row.reviewsLast30Days - row.reviewsPrevious30Days;
  const direction = growth > 0 ? "up" : growth < 0 ? "down" : "flat";
  return (
    <tr data-you={row.isYou}>
      <th scope="row">
        {row.isYou ? `${row.name} (${copy.you})` : row.name}
        {!row.websiteUrl && <span className={styles.sub}>{copy.table.noWebsite}</span>}
      </th>
      <td className={styles.num}>{row.averageRating.toFixed(1)} ★</td>
      <td className={styles.num}>{row.reviewCount.toLocaleString("en-CA")}</td>
      <td className={styles.num}>
        +{row.reviewsLast30Days}
        <span className={styles.sub}>
          <span className={styles.delta} data-direction={direction}>
            {direction === "up" && <TrendingUp aria-hidden size={12} />}
            {direction === "down" && <TrendingDown aria-hidden size={12} />}
            {copy.table.growthVsPrevious.replace("{change}", `${growth > 0 ? "+" : ""}${growth}`)}
          </span>
        </span>
      </td>
      <td className={styles.num}>{row.services.length}</td>
      <td className={styles.num}>{row.pageCount}</td>
      <td className={styles.num}>{row.postsLast90Days}</td>
      <td className={styles.num}>{row.photoCount}</td>
      <td className={styles.num}>
        {row.averageMapPosition === null ? copy.table.notShowing : `#${row.averageMapPosition.toFixed(1)}`}
      </td>
    </tr>
  );
}

function MapComparison({
  you,
  competitors,
  copy,
}: {
  you: CompetitorProfile;
  competitors: readonly CompetitorProfile[];
  copy: CompetitorsCopy;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} style={{ minWidth: 460 }}>
        <caption>{copy.maps.heading}</caption>
        <thead>
          <tr>
            <th scope="col">{copy.maps.service}</th>
            <th scope="col" className={styles.num}>
              {copy.maps.you}
            </th>
            <th scope="col">{copy.maps.best}</th>
            <th scope="col" className={styles.num}>
              {copy.maps.ahead}
            </th>
          </tr>
        </thead>
        <tbody>
          {you.mapPositions.map((own) => {
            const rivals = competitors
              .map((rival) => ({
                name: rival.name,
                position: rival.mapPositions.find((row) => row.serviceSlug === own.serviceSlug)?.mapPosition ?? null,
              }))
              .filter((rival): rival is { name: string; position: number } => rival.position !== null)
              .sort((a, b) => a.position - b.position);
            const best = rivals[0] ?? null;
            const ahead = rivals.filter((rival) => own.mapPosition === null || rival.position < own.mapPosition).length;
            return (
              <tr key={own.serviceSlug}>
                <th scope="row">{own.serviceName}</th>
                <td className={styles.num}>
                  {own.mapPosition === null ? copy.maps.notShowing : `#${own.mapPosition}`}
                </td>
                <td>{best ? `${best.name} · #${best.position}` : "—"}</td>
                <td className={styles.num}>{ahead}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
