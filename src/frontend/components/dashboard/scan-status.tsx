"use client";
// Scan progress on Home. Before anything has landed it sits centred on the page; when the first result arrives
// it minimises — pinching and shrinking like a window into the Dock — into a pill at the bottom of the screen,
// which lists the running steps on hover, focus or tap.
import { Check, CircleDashed, LoaderCircle, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type Ref, type RefObject } from "react";
import type { DashboardCopy } from "@/frontend/copy/dashboard";
import { MAX_STEP_ATTEMPTS } from "@/shared/constants/scan-steps";
import type { ScanProgress } from "@/shared/types/dashboard";
import styles from "./scan-status.module.css";

type ScanStatusProps = {
  scan: ScanProgress;
  copy: DashboardCopy;
};

/** How long the minimise takes. Long enough to follow with the eye, short enough not to hold anyone up. */
const MINIMIZE_MS = 720;

function StepList({ scan, copy }: ScanStatusProps) {
  return (
    <ol className={styles.steps}>
      {scan.steps.map((step) => (
        <li key={step.step} className={styles.step} data-status={step.status}>
          <span className={styles.icon}>
            {step.status === "done" && <Check aria-hidden size={14} strokeWidth={3} />}
            {step.status === "running" && <LoaderCircle aria-hidden size={14} className={styles.spinner} />}
            {step.status === "failed" && <X aria-hidden size={14} strokeWidth={3} />}
            {step.status === "waiting" && <CircleDashed aria-hidden size={14} />}
          </span>
          <span className={styles.label}>{copy.steps[step.step]}</span>
          <span className={styles.status}>
            {step.status === "running" && step.retryCount > 0
              ? copy.scanning.retrying
                  .replace("{attempt}", String(step.retryCount + 1))
                  .replace("{max}", String(MAX_STEP_ATTEMPTS))
              : copy.scanning.status[step.status]}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Meter({ percent, label }: { percent: number; label: string }) {
  return (
    <span
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <span className={styles.fill} style={{ width: `${percent}%` }} />
    </span>
  );
}

function PanelBody({ scan, copy }: ScanStatusProps) {
  const text = copy.scanning;
  return (
    <>
      <h2 className={styles.panelHeading}>
        <LoaderCircle aria-hidden size={22} className={styles.spinner} />
        {text.heading}
      </h2>
      <p className={styles.panelIntro}>{text.intro}</p>
      <div className={styles.panelMeter}>
        <Meter percent={scan.percentComplete} label={text.heading} />
        <span className={styles.percent}>{text.percent.replace("{percent}", String(scan.percentComplete))}</span>
      </div>
      <StepList scan={scan} copy={copy} />
    </>
  );
}

/** Full-size state for the first moments of a scan, centred in the space below the header. */
export function ScanningPanel({ scan, copy, panelRef }: ScanStatusProps & { panelRef?: Ref<HTMLElement> }) {
  return (
    <div className={styles.stage}>
      <section ref={panelRef} className={styles.panel} aria-label={copy.scanning.heading}>
        <PanelBody scan={scan} copy={copy} />
      </section>
    </div>
  );
}

/**
 * A copy of the panel, fixed where the real one was, animated into the pill. The funnel-shaped clip path is
 * what gives it the Dock "genie" feel: the edge nearest the pill pinches first, then the rest follows.
 */
export function ScanMinimize({
  scan,
  copy,
  from,
  targetRef,
  onDone,
}: ScanStatusProps & { from: DOMRect; targetRef: RefObject<HTMLElement | null>; onDone: () => void }) {
  const cloneRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const clone = cloneRef.current;
    const target = targetRef.current?.getBoundingClientRect();
    if (!clone || !target) {
      doneRef.current();
      return;
    }

    const dx = target.left + target.width / 2 - (from.left + from.width / 2);
    const dy = target.top + target.height / 2 - (from.top + from.height / 2);
    const scaleX = target.width / from.width;
    const scaleY = target.height / from.height;

    const animation = clone.animate(
      [
        {
          transform: "translate(0, 0) scale(1, 1)",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          opacity: 1,
        },
        {
          offset: 0.35,
          transform: `translate(${dx * 0.12}px, ${dy * 0.22}px) scale(0.9, 0.94)`,
          clipPath: "polygon(10% 0%, 100% 0%, 100% 100%, 62% 100%)",
          opacity: 1,
        },
        {
          offset: 0.72,
          transform: `translate(${dx * 0.62}px, ${dy * 0.78}px) scale(${Math.max(scaleX, 0.3)}, ${Math.max(scaleY, 0.28)})`,
          clipPath: "polygon(42% 0%, 100% 0%, 100% 100%, 88% 100%)",
          opacity: 0.9,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
          clipPath: "polygon(48% 0%, 52% 0%, 52% 100%, 48% 100%)",
          opacity: 0,
        },
      ],
      { duration: MINIMIZE_MS, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" },
    );
    animation.onfinish = () => doneRef.current();
    return () => animation.cancel();
  }, [from, targetRef]);

  return (
    <div
      ref={cloneRef}
      className={`${styles.panel} ${styles.clone}`}
      style={{ left: from.left, top: from.top, width: from.width, height: from.height }}
      aria-hidden
    >
      <PanelBody scan={scan} copy={copy} />
    </div>
  );
}

/** The minimised form: a pill pinned to the bottom of the screen, expanding into the step list. */
export function ScanIndicator({
  scan,
  copy,
  pillRef,
  phase,
}: ScanStatusProps & { pillRef?: Ref<HTMLButtonElement>; phase: "arriving" | "landed" | "resting" }) {
  const text = copy.scanning;
  const popoverId = useId();
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);

  return (
    <div className={styles.indicator} data-open={isPinnedOpen} data-phase={phase}>
      <div id={popoverId} className={styles.popover} role="region" aria-label={text.popoverHeading}>
        <p className={styles.popoverHeading}>{text.popoverHeading}</p>
        <Meter percent={scan.percentComplete} label={text.popoverHeading} />
        <StepList scan={scan} copy={copy} />
      </div>
      <button
        ref={pillRef}
        type="button"
        className={styles.pill}
        aria-expanded={isPinnedOpen}
        aria-controls={popoverId}
        onClick={() => setIsPinnedOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsPinnedOpen(false);
        }}
      >
        <LoaderCircle aria-hidden size={15} className={styles.spinner} />
        <span role="status">
          {text.pill} · {text.percent.replace("{percent}", String(scan.percentComplete))}
        </span>
      </button>
    </div>
  );
}
