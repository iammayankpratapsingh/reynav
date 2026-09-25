"use client";
// Renders whatever the scan has produced so far and polls for the rest. Server-rendered data is the first
// frame, so the screen is never blank; polling stops the moment the scan is finished or failed.
// Until the first result lands the scan sits centred on the page; then it minimises into a pill at the bottom.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { scanActiveLocationAction } from "@/app/(app)/locations-actions";
import { fetchScanView } from "@/frontend/lib/api-client";
import type { DashboardCopy } from "@/frontend/copy/dashboard";
import type { DashboardData } from "@/shared/types/dashboard";
import type { AppNotification } from "@/shared/types/notification";
import { SUB_SCORE_KEYS } from "@/shared/types/score";
import { GrowthScoreCard } from "./growth-score-card";
import { NotificationBell } from "./notification-bell";
import { OpportunityList } from "./opportunity-list";
import { RecommendedToday } from "./recommended-today";
import { ScoreHistory } from "./score-history";
import { ScanIndicator, ScanMinimize, ScanningPanel } from "./scan-status";
import { SubScoreTiles } from "./sub-score-tiles";
import styles from "./dashboard-view.module.css";

type DashboardViewProps = {
  initial: DashboardData;
  copy: DashboardCopy;
  greeting: string;
  formattedDate: string;
  notifications: readonly AppNotification[];
};

const POLL_MS = 1200;
/** How long the pill's landing bounce plays before it settles. */
const LANDING_MS = 600;

/** panel → minimizing → landed → resting. Straight to resting when there is nothing to animate. */
type ScanPhase = "panel" | "minimizing" | "landed" | "resting";

function hasAnyResult(data: DashboardData): boolean {
  return data.scores.subScores.length > 0 || data.scores.growth !== null || data.opportunities.length > 0;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function DashboardView({ initial, copy, greeting, formattedDate, notifications }: DashboardViewProps) {
  const [data, setData] = useState(initial);
  const [pollError, setPollError] = useState(false);
  const scanId = data.scan?.scanId ?? null;
  const isRunning = data.scan !== null && !data.isComplete;
  const latest = useRef(data);
  latest.current = data;
  const hasFirstResult = hasAnyResult(data);

  const [phase, setPhase] = useState<ScanPhase>(isRunning && !hasFirstResult ? "panel" : "resting");
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  // The first result has landed while the panel is still up: measure it before it unmounts and minimise.
  useLayoutEffect(() => {
    if (phase !== "panel" || (!hasFirstResult && isRunning)) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!hasFirstResult || !rect || prefersReducedMotion()) {
      setPhase("resting");
      return;
    }
    setPanelRect(rect);
    setPhase("minimizing");
  }, [phase, hasFirstResult, isRunning]);

  useEffect(() => {
    if (phase !== "landed") return;
    const timer = setTimeout(() => setPhase("resting"), LANDING_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!scanId || !isRunning) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const next = await fetchScanView(scanId, controller.signal);
        setPollError(false);
        setData(next);
        if (!next.isComplete) timer = setTimeout(poll, POLL_MS);
      } catch (error) {
        if (controller.signal.aborted) return;
        // A dropped poll is not fatal: keep the data already on screen and try again.
        setPollError(true);
        timer = setTimeout(poll, POLL_MS * 2);
      }
    };

    timer = setTimeout(poll, POLL_MS);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [scanId, isRunning]);

  if (!data.scan) {
    return (
      <div className={styles.page}>
        <Header
          greeting={greeting}
          name={data.organizationName}
          date={formattedDate}
          location={data.locationLabel}
          actions={<NotificationBell items={notifications} copy={copy.notifications} />}
        />
        <section className={styles.empty}>
          <h2 className={styles.emptyHeading}>{copy.empty.heading}</h2>
          <p className={styles.emptyBody}>{copy.empty.body}</p>
          <ScanLocationButton copy={copy.empty} />
        </section>
      </div>
    );
  }

  const signalsDone = data.scores.subScores.length;
  const opportunitiesPending = !data.isComplete;
  const nextScan = data.nextScanAt
    ? copy.nextScan.replace(
        "{date}",
        new Date(data.nextScanAt).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" }),
      )
    : null;
  const header = (
    <Header
      greeting={greeting}
      name={data.organizationName}
      date={nextScan ? `${formattedDate} · ${nextScan}` : formattedDate}
      location={data.locationLabel}
      actions={<NotificationBell items={notifications} copy={copy.notifications} />}
    />
  );
  const pollNotice = pollError && <p className={styles.pollError}>{copy.scanning.pollError}</p>;

  if (phase === "panel") {
    return (
      <div className={styles.page}>
        {header}
        {pollNotice}
        <ScanningPanel scan={data.scan} copy={copy} panelRef={panelRef} />
      </div>
    );
  }

  const showIndicator = isRunning || phase === "minimizing" || phase === "landed";

  return (
    <>
      <div className={styles.page} data-reveal={phase === "minimizing" || phase === "landed"}>
        {header}
        {pollNotice}

        <GrowthScoreCard
          copy={copy.growth}
          score={data.scores.growth}
          scan={data.scan}
          signalsDone={signalsDone}
          signalsTotal={SUB_SCORE_KEYS.length}
        />

        <SubScoreTiles copy={copy.subScores} subScores={data.scores.subScores} />

        <div className={styles.insights}>
          <RecommendedToday copy={copy.recommended} actions={data.recommendedToday} />
          <ScoreHistory copy={copy.history} points={data.history} />
        </div>

        <OpportunityList
          copy={copy.opportunities}
          opportunities={data.opportunities}
          isPending={opportunitiesPending}
        />

        <p className={styles.note}>{copy.simulatedNote}</p>
      </div>

      {showIndicator && (
        <ScanIndicator
          scan={data.scan}
          copy={copy}
          pillRef={pillRef}
          phase={phase === "minimizing" ? "arriving" : phase === "landed" ? "landed" : "resting"}
        />
      )}
      {phase === "minimizing" && panelRect && (
        <ScanMinimize
          scan={data.scan}
          copy={copy}
          from={panelRect}
          targetRef={pillRef}
          onDone={() => setPhase("landed")}
        />
      )}
    </>
  );
}

function Header({
  greeting,
  name,
  date,
  location,
  actions,
}: {
  greeting: string;
  name: string;
  date: string;
  location: string;
  actions: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.greeting}>
          {greeting}, {name}!
        </h1>
        <p className={styles.date}>{date}</p>
      </div>
      <div className={styles.account}>
        {actions}
        <Link href="/profile" className={styles.profileLink}>
          <span className={styles.avatar} aria-hidden>
            {name.slice(0, 1)}
          </span>
          <span>
            <span className={styles.accountName}>{name}</span>
            <span className={styles.accountMeta}>{location}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

/** Starts the first scan of a location that has none yet — typically one just added. */
function ScanLocationButton({ copy }: { copy: DashboardCopy["empty"] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isStarting, startTransition] = useTransition();
  return (
    <>
      <button
        type="button"
        className={styles.emptyCta}
        disabled={isStarting}
        onClick={() =>
          startTransition(async () => {
            const result = await scanActiveLocationAction();
            if (result.error) setError(result.error);
            else router.refresh();
          })
        }
      >
        {isStarting ? copy.starting : copy.scan}
      </button>
      {error && <p className={styles.pollError}>{error}</p>}
    </>
  );
}
