"use client";
// Growth journey: a winding road through each product step; scrolling drives a traveller along it.
import {
  Check,
  Flag,
  Gauge,
  Navigation,
  PenLine,
  Plug,
  ScanSearch,
  Sparkles,
  Target,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HomeCopy } from "@/frontend/copy/home";
import { JourneyPreview } from "./journey-previews";
import styles from "./growth-journey.module.css";

type JourneyCopy = HomeCopy["journey"];
type StepId = JourneyCopy["steps"][number]["id"];

const stepIcons: Record<StepId, LucideIcon> = {
  connect: Plug,
  scan: ScanSearch,
  score: Gauge,
  opportunities: Target,
  content: PenLine,
  results: TrendingUp,
};

type Point = { x: number; y: number };
type RoadGeometry = { d: string; width: number; height: number; nodes: Point[] };
type Sample = { length: number; x: number; y: number };

const TRIGGER_RATIO = 0.62;
const SAMPLE_COUNT = 400;

function buildRoad(points: Point[]): string {
  const [first, ...rest] = points;
  if (!first) return "";
  let d = `M ${first.x} ${first.y}`;
  let previous = first;
  for (const point of rest) {
    const midY = (previous.y + point.y) / 2;
    d += ` C ${previous.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`;
    previous = point;
  }
  return d;
}

function lengthAtY(samples: Sample[], targetY: number): number {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!first || !last) return 0;
  if (targetY <= first.y) return 0;
  if (targetY >= last.y) return last.length;
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if ((samples[mid]?.y ?? 0) < targetY) low = mid;
    else high = mid;
  }
  const a = samples[low];
  const b = samples[high];
  if (!a || !b || b.y === a.y) return a?.length ?? 0;
  return a.length + ((targetY - a.y) / (b.y - a.y)) * (b.length - a.length);
}

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return prefersReduced;
}

export function GrowthJourney({ copy }: { copy: JourneyCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGPathElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const samplesRef = useRef<Sample[]>([]);
  const totalRef = useRef(0);
  const reachedRef = useRef(-1);

  const [geometry, setGeometry] = useState<RoadGeometry | null>(null);
  const [reachedCount, setReachedCount] = useState(0);
  const reduceMotion = usePrefersReducedMotion();

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const box = container.getBoundingClientRect();
    const nodes = nodeRefs.current
      .filter((node): node is HTMLSpanElement => node !== null)
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
      });
    const first = nodes[0];
    if (!first) return;
    const start = { x: first.x, y: Math.max(0, first.y - 140) };
    setGeometry({ d: buildRoad([start, ...nodes]), width: box.width, height: box.height, nodes });
  }, []);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  const update = useCallback(() => {
    const container = containerRef.current;
    const progress = progressRef.current;
    const traveler = travelerRef.current;
    if (!container || !progress || !traveler || !geometry) return;

    const total = totalRef.current;
    const targetY = reduceMotion
      ? Number.POSITIVE_INFINITY
      : window.innerHeight * TRIGGER_RATIO - container.getBoundingClientRect().top;
    const length = reduceMotion ? total : lengthAtY(samplesRef.current, targetY);

    progress.style.strokeDashoffset = `${total - length}`;
    const base = baseRef.current;
    if (base) {
      const point = base.getPointAtLength(length);
      const ahead = base.getPointAtLength(Math.min(total, length + 2));
      const heading = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI + 45;
      traveler.style.transform = `translate(${point.x}px, ${point.y}px)`;
      traveler.style.setProperty("--heading", `${heading}deg`);
    }
    traveler.dataset.visible = length > 0 && length < total - 4 ? "true" : "false";

    const reached = geometry.nodes.filter((node) => node.y <= targetY + 1).length;
    if (reached !== reachedRef.current) {
      reachedRef.current = reached;
      setReachedCount(reached);
    }
  }, [geometry, reduceMotion]);

  useEffect(() => {
    const base = baseRef.current;
    const progress = progressRef.current;
    if (!geometry || !base || !progress) return;

    const total = base.getTotalLength();
    totalRef.current = total;
    samplesRef.current = Array.from({ length: SAMPLE_COUNT + 1 }, (_, index) => {
      const length = (index / SAMPLE_COUNT) * total;
      const point = base.getPointAtLength(length);
      return { length, x: point.x, y: point.y };
    });
    progress.style.strokeDasharray = `${total}`;
    reachedRef.current = -1;
    update();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [geometry, update]);

  const stateOf = (index: number) =>
    index < reachedCount - 1 ? "done" : index === reachedCount - 1 ? "active" : "upcoming";
  const finishIndex = copy.steps.length;

  return (
    <section id="journey" className={styles.section} aria-labelledby="journey-heading">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="journey-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.lead}>{copy.intro}</p>
      </div>

      <div ref={containerRef} className={styles.journey}>
        {geometry && (
          <svg
            className={styles.road}
            width={geometry.width}
            height={geometry.height}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            aria-hidden
          >
            <defs>
              <linearGradient id="journey-progress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f08aa9" />
                <stop offset="100%" stopColor="#d4557a" />
              </linearGradient>
            </defs>
            <path d={geometry.d} className={styles.roadCurb} />
            <path ref={baseRef} d={geometry.d} className={styles.roadSurface} />
            <path d={geometry.d} className={styles.roadLine} />
            <path ref={progressRef} d={geometry.d} className={styles.roadProgress} stroke="url(#journey-progress)" />
          </svg>
        )}

        <div ref={travelerRef} className={styles.traveler} data-visible="false" aria-hidden>
          <span className={styles.travelerPulse} />
          <span className={styles.travelerDot}>
            <Navigation size={18} strokeWidth={2.5} />
          </span>
        </div>

        <ol className={styles.steps}>
          {copy.steps.map((step, index) => {
            const Icon = stepIcons[step.id];
            const state = stateOf(index);
            return (
              <li
                key={step.id}
                className={styles.step}
                data-side={index % 2 === 0 ? "left" : "right"}
                data-state={state}
              >
                <div className={styles.text}>
                  <span className={styles.stepLabel}>
                    {copy.stepLabel} {index + 1}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                  <dl className={styles.roles}>
                    <div className={styles.role}>
                      <dt>
                        <User aria-hidden size={15} />
                        {copy.youLabel}
                      </dt>
                      <dd>{step.you}</dd>
                    </div>
                    <div className={styles.role}>
                      <dt>
                        <Sparkles aria-hidden size={15} />
                        {copy.reynavLabel}
                      </dt>
                      <dd>{step.reynav}</dd>
                    </div>
                  </dl>
                </div>

                <div className={styles.roadCell}>
                  <span
                    ref={(node) => {
                      nodeRefs.current[index] = node;
                    }}
                    className={styles.node}
                    aria-hidden
                  >
                    {state === "done" ? <Check size={22} strokeWidth={3} /> : <Icon size={22} strokeWidth={2.25} />}
                  </span>
                </div>

                <div className={styles.preview}>
                  <JourneyPreview
                    step={step}
                    note={copy.previewNote}
                    isReached={state !== "upcoming"}
                    reduceMotion={reduceMotion}
                  />
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.finish} data-state={reachedCount > finishIndex ? "active" : "upcoming"}>
          <span
            ref={(node) => {
              nodeRefs.current[finishIndex] = node;
            }}
            className={styles.finishNode}
            aria-hidden
          >
            <Flag size={28} strokeWidth={2.25} />
          </span>
          <h3 className={styles.finishTitle}>{copy.finish.title}</h3>
          <p className={styles.finishBody}>{copy.finish.body}</p>
        </div>
      </div>
    </section>
  );
}
