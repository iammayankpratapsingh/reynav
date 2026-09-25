"use client";
// How it works: data sources flow along animated connectors into the REYNAV engine and out as results.
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Gauge,
  Globe,
  Lock,
  MapPin,
  MousePointerClick,
  PenLine,
  Search,
  Server,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { HomeCopy } from "@/frontend/copy/home";
import styles from "./how-it-works.module.css";

type HowCopy = HomeCopy["howItWorks"];
type SourceId = HowCopy["sources"][number]["id"];
type OutputId = HowCopy["outputs"][number]["id"];

const sourceIcons: Record<SourceId, LucideIcon> = {
  website: Globe,
  listing: MapPin,
  search: Search,
  analytics: BarChart3,
  booking: CalendarCheck,
};

const outputIcons: Record<OutputId, LucideIcon> = {
  score: Gauge,
  opportunities: Target,
  content: PenLine,
  reports: ClipboardList,
};

const trustIcons: LucideIcon[] = [Lock, Server, MousePointerClick];

const CYCLE_MS = 2800;

type Wire = { id: string; d: string; kind: "in" | "out"; index: number };
type Geometry = { width: number; height: number; wires: Wire[] };

function curve(from: { x: number; y: number }, to: { x: number; y: number }, isHorizontal: boolean): string {
  if (isHorizontal) {
    const midX = (from.x + to.x) / 2;
    return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  }
  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
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

export function HowItWorks({ copy }: { copy: HowCopy }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const outputRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(true);
  const reduceMotion = usePrefersReducedMotion();

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const engine = engineRef.current;
    if (!stage || !engine) return;
    const box = stage.getBoundingClientRect();
    const core = engine.getBoundingClientRect();
    const sources = sourceRefs.current.filter((node): node is HTMLButtonElement => node !== null);
    const outputs = outputRefs.current.filter((node): node is HTMLLIElement => node !== null);
    const firstSource = sources[0]?.getBoundingClientRect();
    if (!firstSource) return;

    const isHorizontal = firstSource.right <= core.left;
    const coreCenter = { x: core.left + core.width / 2 - box.left, y: core.top + core.height / 2 - box.top };
    const spread = (index: number, count: number) => (index - (count - 1) / 2) * (isHorizontal ? 14 : 18);

    const wires: Wire[] = [
      ...sources.map((node, index) => {
        const rect = node.getBoundingClientRect();
        const from = isHorizontal
          ? { x: rect.right - box.left, y: rect.top + rect.height / 2 - box.top }
          : { x: rect.left + rect.width / 2 - box.left, y: rect.bottom - box.top };
        const to = isHorizontal
          ? { x: core.left - box.left + 6, y: coreCenter.y + spread(index, sources.length) }
          : { x: coreCenter.x + spread(index, sources.length), y: core.top - box.top + 6 };
        return { id: `in-${index}`, d: curve(from, to, isHorizontal), kind: "in" as const, index };
      }),
      ...outputs.map((node, index) => {
        const rect = node.getBoundingClientRect();
        const from = isHorizontal
          ? { x: core.right - box.left - 6, y: coreCenter.y + spread(index, outputs.length) }
          : { x: coreCenter.x + spread(index, outputs.length), y: core.bottom - box.top - 6 };
        const to = isHorizontal
          ? { x: rect.left - box.left, y: rect.top + rect.height / 2 - box.top }
          : { x: rect.left + rect.width / 2 - box.left, y: rect.top - box.top };
        return { id: `out-${index}`, d: curve(from, to, isHorizontal), kind: "out" as const, index };
      }),
    ];
    setGeometry({ width: box.width, height: box.height, wires });
  }, []);

  useLayoutEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!isAuto || reduceMotion) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % copy.sources.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [isAuto, reduceMotion, copy.sources.length]);

  const select = (index: number) => {
    setIsAuto(false);
    setActiveIndex(index);
  };

  const active = copy.sources[activeIndex] ?? copy.sources[0];

  return (
    <section id="how-it-works" className={styles.section} aria-labelledby="how-heading">
      <div className={styles.glowA} aria-hidden />
      <div className={styles.glowB} aria-hidden />

      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="how-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.lead}>{copy.intro}</p>
      </div>

      <div ref={stageRef} className={styles.stage}>
        {geometry && (
          <svg
            className={styles.wires}
            width={geometry.width}
            height={geometry.height}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            aria-hidden
          >
            <defs>
              <linearGradient id="wire-active" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f08aa9" />
                <stop offset="100%" stopColor="#d4557a" />
              </linearGradient>
            </defs>
            {geometry.wires.map((wire) => {
              const isLit = wire.kind === "out" || wire.index === activeIndex;
              return (
                <g key={wire.id} className={isLit ? styles.wireLit : styles.wire}>
                  <path d={wire.d} className={styles.wireBase} />
                  <path d={wire.d} className={styles.wireFlow} />
                  {!reduceMotion &&
                    [0, 1, 2].map((particle) => (
                      <circle key={`${particle}-${isLit}`} r={isLit ? 4 : 2.5} className={styles.particle}>
                        <animateMotion
                          dur={isLit ? "1.8s" : "3.6s"}
                          begin={`${particle * (isLit ? 0.6 : 1.2)}s`}
                          repeatCount="indefinite"
                          path={wire.d}
                        />
                      </circle>
                    ))}
                </g>
              );
            })}
          </svg>
        )}

        <div className={`${styles.column} ${styles.sourcesColumn}`}>
          <p className={styles.columnLabel}>{copy.sourcesLabel}</p>
          <div className={styles.sources}>
            {copy.sources.map((source, index) => {
              const Icon = sourceIcons[source.id];
              const isActive = index === activeIndex;
              return (
                <button
                  key={source.id}
                  ref={(node) => {
                    sourceRefs.current[index] = node;
                  }}
                  type="button"
                  className={styles.source}
                  data-active={isActive}
                  aria-pressed={isActive}
                  onClick={() => select(index)}
                >
                  <span className={styles.sourceIcon}>
                    <Icon aria-hidden size={18} />
                  </span>
                  {source.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.center}>
          <div ref={engineRef} className={styles.engine}>
            <span className={styles.engineRing} aria-hidden />
            <span className={styles.engineRingSlow} aria-hidden />
            <span className={styles.engineCore}>
              <span className={styles.engineName}>{copy.engineLabel}</span>
              <span className={styles.engineSub}>{copy.engineSub}</span>
            </span>
            <ul className={styles.orbit}>
              {copy.engineTasks.map((task, index) => (
                <li
                  key={task}
                  className={styles.orbitItem}
                  style={{ "--angle": `${(360 / copy.engineTasks.length) * index - 90}deg` } as CSSProperties}
                >
                  <span className={styles.orbitChip}>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className={styles.taskList}>
            {copy.engineTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>

          <div className={styles.caption} aria-live="polite">
            <p className={styles.captionTitle}>{active?.label}</p>
            <p className={styles.captionBody}>{active?.detail}</p>
          </div>
          <p className={styles.hint}>{copy.selectHint}</p>
        </div>

        <div className={`${styles.column} ${styles.outputsColumn}`}>
          <p className={styles.columnLabel}>{copy.outputsLabel}</p>
          <ul className={styles.outputs}>
            {copy.outputs.map((output, index) => {
              const Icon = outputIcons[output.id];
              return (
                <li
                  key={output.id}
                  ref={(node) => {
                    outputRefs.current[index] = node;
                  }}
                  className={styles.output}
                  style={{ "--delay": `${index * 0.45}s` } as CSSProperties}
                >
                  <span className={styles.outputIcon}>
                    <Icon aria-hidden size={18} />
                  </span>
                  {output.label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ul className={styles.trust}>
        {copy.trust.map((item, index) => {
          const Icon = trustIcons[index] ?? Lock;
          return (
            <li key={item}>
              <Icon aria-hidden size={16} />
              {item}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
