"use client";
// Mini product simulations shown beside each growth journey step; they play once the step is reached.
import { useEffect, useState, type CSSProperties } from "react";
import {
  Check,
  CircleDashed,
  Globe,
  LoaderCircle,
  MapPin,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import type { HomeCopy } from "@/frontend/copy/home";
import styles from "./journey-previews.module.css";

type Steps = HomeCopy["journey"]["steps"];
type StepOf<Id extends Steps[number]["id"]> = Extract<Steps[number], { id: Id }>;

type PreviewProps<Id extends Steps[number]["id"]> = {
  preview: StepOf<Id>["preview"];
  isReached: boolean;
  reduceMotion: boolean;
};

function useSequence(isReached: boolean, count: number, intervalMs: number, reduceMotion: boolean) {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (!isReached) return;
    if (reduceMotion) {
      setCompleted(count);
      return;
    }
    const timer = setInterval(() => {
      setCompleted((current) => {
        if (current >= count) {
          clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isReached, count, intervalMs, reduceMotion]);

  return completed;
}

const connectIcons = [Globe, MapPin, CalendarCheck];

function ConnectPreview({ preview, isReached, reduceMotion }: PreviewProps<"connect">) {
  const completed = useSequence(isReached, preview.items.length, 550, reduceMotion);
  return (
    <ul className={styles.rows}>
      {preview.items.map((item, index) => {
        const Icon = connectIcons[index] ?? Globe;
        const isDone = index < completed;
        return (
          <li key={item} className={styles.row}>
            <span className={styles.rowIcon}>
              <Icon aria-hidden size={18} />
            </span>
            <span className={styles.rowLabel}>{item}</span>
            <span className={isDone ? styles.statusDone : styles.statusIdle}>
              {isDone ? <Check aria-hidden size={14} /> : <LoaderCircle aria-hidden size={14} className={styles.spin} />}
              {isDone ? preview.done : preview.pending}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ScanPreview({ preview, isReached, reduceMotion }: PreviewProps<"scan">) {
  const completed = useSequence(isReached, preview.items.length, 650, reduceMotion);
  return (
    <ul className={styles.rows}>
      {preview.items.map((item, index) => {
        const status = index < completed ? "done" : index === completed && isReached ? "running" : "waiting";
        return (
          <li key={item} className={styles.row}>
            <span className={styles.rowLabel}>{item}</span>
            {status === "done" && (
              <span className={styles.statusDone}>
                <Check aria-hidden size={14} />
                {preview.done}
              </span>
            )}
            {status === "running" && (
              <span className={styles.statusRunning}>
                <LoaderCircle aria-hidden size={14} className={styles.spin} />
                {preview.running}
              </span>
            )}
            {status === "waiting" && (
              <span className={styles.statusIdle}>
                <CircleDashed aria-hidden size={14} />
                {preview.waiting}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const scoreFills = [0.78, 0.84, 0.62, 0.45, 0.88, 0.74];

function ScorePreview({ preview }: PreviewProps<"score">) {
  return (
    <div className={styles.score}>
      <div className={styles.meterTrack}>
        <span className={styles.meterFill} />
      </div>
      <ul className={styles.bars}>
        {preview.items.map((item, index) => (
          <li key={item} className={styles.barRow}>
            <span className={styles.barLabel}>{item}</span>
            <span className={styles.barTrack}>
              <span
                className={styles.barFill}
                style={{ "--fill": scoreFills[index] ?? 0.6, "--delay": `${index * 90}ms` } as CSSProperties}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OpportunitiesPreview({ preview }: PreviewProps<"opportunities">) {
  return (
    <ol className={styles.opportunities}>
      {preview.items.map((item, index) => (
        <li
          key={item.title}
          className={styles.opportunity}
          style={{ "--delay": `${index * 160}ms` } as CSSProperties}
        >
          <span className={styles.rank}>{index + 1}</span>
          <span className={styles.opportunityText}>
            <span className={styles.opportunityTitle}>{item.title}</span>
            <span className={styles.opportunityNote}>{item.note}</span>
          </span>
          <span className={item.tone === "high" ? styles.impactHigh : styles.impactMedium}>{item.impact}</span>
        </li>
      ))}
    </ol>
  );
}

function ContentPreview({ preview, isReached, reduceMotion }: PreviewProps<"content">) {
  const completed = useSequence(isReached, preview.items.length, 800, reduceMotion);
  return (
    <div className={styles.content}>
      <div className={styles.chips}>
        {preview.items.map((item, index) => (
          <span key={item} className={index < completed ? styles.chipDone : styles.chip}>
            {index < completed ? <Check aria-hidden size={13} /> : <Sparkles aria-hidden size={13} />}
            {item}
          </span>
        ))}
      </div>
      <div className={styles.doc}>
        <span className={styles.docTitle} />
        <span className={styles.docLine} style={{ "--w": "92%", "--delay": "0ms" } as CSSProperties} />
        <span className={styles.docLine} style={{ "--w": "84%", "--delay": "350ms" } as CSSProperties} />
        <span className={styles.docLine} style={{ "--w": "96%", "--delay": "700ms" } as CSSProperties} />
        <span className={styles.docLine} style={{ "--w": "58%", "--delay": "1050ms" } as CSSProperties} />
      </div>
      <span className={completed >= preview.items.length ? styles.statusDone : styles.statusRunning}>
        {completed >= preview.items.length ? (
          <Check aria-hidden size={14} />
        ) : (
          <LoaderCircle aria-hidden size={14} className={styles.spin} />
        )}
        {completed >= preview.items.length ? preview.ready : preview.writing}
      </span>
    </div>
  );
}

function ResultsPreview({ preview }: PreviewProps<"results">) {
  return (
    <div className={styles.results}>
      <svg viewBox="0 0 300 120" className={styles.chart} aria-hidden>
        <line x1="0" y1="119" x2="300" y2="119" className={styles.axis} />
        <path d="M0 100 C 40 96, 60 88, 90 84 S 150 70, 180 58 S 250 34, 300 18" className={styles.lineA} pathLength={1} />
        <path d="M0 108 C 50 106, 70 100, 100 96 S 160 86, 200 72 S 260 52, 300 40" className={styles.lineB} pathLength={1} />
      </svg>
      <ul className={styles.legend}>
        <li>
          <span className={styles.swatchA} aria-hidden />
          {preview.items[0]}
        </li>
        <li>
          <span className={styles.swatchB} aria-hidden />
          {preview.items[1]}
        </li>
      </ul>
    </div>
  );
}

type JourneyPreviewProps = {
  step: Steps[number];
  note: string;
  isReached: boolean;
  reduceMotion: boolean;
};

export function JourneyPreview({ step, note, isReached, reduceMotion }: JourneyPreviewProps) {
  const shared = { isReached, reduceMotion };
  return (
    <div className={styles.panel} data-reached={isReached}>
      <div className={styles.panelHeader}>
        <span className={styles.dots} aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.panelTitle}>{step.preview.heading}</span>
      </div>
      <div className={styles.panelBody}>
        {step.id === "connect" && <ConnectPreview preview={step.preview} {...shared} />}
        {step.id === "scan" && <ScanPreview preview={step.preview} {...shared} />}
        {step.id === "score" && <ScorePreview preview={step.preview} {...shared} />}
        {step.id === "opportunities" && <OpportunitiesPreview preview={step.preview} {...shared} />}
        {step.id === "content" && <ContentPreview preview={step.preview} {...shared} />}
        {step.id === "results" && <ResultsPreview preview={step.preview} {...shared} />}
      </div>
      <p className={styles.note}>{note}</p>
    </div>
  );
}
