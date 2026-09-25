"use client";
// Features bento grid: each card has a looping product micro-visual and a cursor-following glow.
import {
  BarChart3,
  Bot,
  Gauge,
  ListOrdered,
  MapPinned,
  MessageSquareHeart,
  PenLine,
  Send,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import type { HomeCopy } from "@/frontend/copy/home";
import { DotField } from "./dot-field";
import styles from "./feature-grid.module.css";

type GridCopy = HomeCopy["featureGrid"];
type Card = GridCopy["cards"][number];
type CardOf<Id extends Card["id"]> = Extract<Card, { id: Id }>;

const cardIcons: Record<Card["id"], LucideIcon> = {
  maps: MapPinned,
  "ai-search": Bot,
  score: Gauge,
  opportunities: ListOrdered,
  content: PenLine,
  reviews: MessageSquareHeart,
  bookings: BarChart3,
};

const competitorPins = [
  { x: 18, y: 30 },
  { x: 72, y: 22 },
  { x: 60, y: 70 },
  { x: 28, y: 74 },
  { x: 86, y: 56 },
];

function MapsVisual({ visual }: { visual: CardOf<"maps">["visual"] }) {
  return (
    <div className={styles.map}>
      <svg className={styles.mapRoads} viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden>
        <path d="M-10 150 C 80 120, 160 190, 250 140 S 380 90, 420 120" />
        <path d="M120 -10 C 140 60, 90 140, 150 230" />
        <path d="M300 -10 C 280 80, 330 150, 290 230" />
        <path d="M-10 60 C 100 80, 260 30, 420 60" />
      </svg>
      {competitorPins.map((pin, index) => (
        <span
          key={`${pin.x}-${pin.y}`}
          className={styles.pin}
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, "--delay": `${index * 0.35}s` } as CSSProperties}
          aria-hidden
        />
      ))}
      <span className={styles.youPin} style={{ left: "46%", top: "44%" }}>
        <span className={styles.youRing} aria-hidden />
        <span className={styles.youLabel}>{visual.you}</span>
      </span>
      <span className={styles.mapLegend}>
        <span className={styles.legendDot} aria-hidden />
        {visual.others}
      </span>
    </div>
  );
}

function AiSearchVisual({ visual }: { visual: CardOf<"ai-search">["visual"] }) {
  return (
    <div className={styles.chat}>
      <p className={styles.question}>{visual.question}</p>
      <p className={styles.answer}>
        <span className={styles.answerIcon} aria-hidden>
          <Sparkles size={14} />
        </span>
        <span className={styles.typing} aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.answerText}>{visual.answer}</span>
      </p>
    </div>
  );
}

function ScoreVisual({ visual }: { visual: CardOf<"score">["visual"] }) {
  return (
    <div className={styles.scoreVisual}>
      <svg viewBox="0 0 120 120" className={styles.ring} aria-hidden>
        <circle cx="60" cy="60" r="50" className={styles.ringTrack} />
        <circle cx="60" cy="60" r="50" className={styles.ringFill} pathLength={1} />
      </svg>
      <span className={styles.ringLabel}>
        <Gauge aria-hidden size={20} />
        {visual.label}
      </span>
      <ul className={styles.scoreParts}>
        {visual.parts.map((part, index) => (
          <li key={part} style={{ "--delay": `${index * 0.12}s` } as CSSProperties}>
            {part}
          </li>
        ))}
      </ul>
    </div>
  );
}

const shuffledFrom = [2, 0, 3, 1];

function OpportunitiesVisual({ visual }: { visual: CardOf<"opportunities">["visual"] }) {
  return (
    <ol className={styles.stack}>
      {visual.items.map((item, index) => (
        <li
          key={item}
          className={styles.stackItem}
          style={{ "--shift": (shuffledFrom[index] ?? index) - index, "--i": index } as CSSProperties}
        >
          <span className={styles.stackRank}>{index + 1}</span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function ContentVisual({ visual }: { visual: CardOf<"content">["visual"] }) {
  return (
    <div className={styles.composer}>
      <span className={styles.composerKind}>
        <PenLine aria-hidden size={13} />
        {visual.kind}
      </span>
      <p className={styles.composerText}>
        <span>{visual.text}</span>
      </p>
      <span className={styles.publish}>
        <Send aria-hidden size={13} />
        {visual.action}
      </span>
    </div>
  );
}

function ReviewsVisual({ visual }: { visual: CardOf<"reviews">["visual"] }) {
  return (
    <div className={styles.reviews}>
      <div className={styles.review}>
        <span className={styles.stars} aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} size={12} fill="currentColor" />
          ))}
        </span>
        <p>{visual.review}</p>
      </div>
      <div className={styles.reply}>
        <span className={styles.replyBadge}>
          <Sparkles aria-hidden size={12} />
          {visual.badge}
        </span>
        <p>{visual.reply}</p>
      </div>
    </div>
  );
}

const barHeights = [0.32, 0.4, 0.38, 0.52, 0.5, 0.64, 0.7, 0.82];

function BookingsVisual({ visual }: { visual: CardOf<"bookings">["visual"] }) {
  return (
    <div className={styles.bookings}>
      <div className={styles.barsChart} aria-hidden>
        {barHeights.map((height, index) => (
          <span key={index} className={styles.barCol}>
            <span
              className={styles.barSearch}
              style={{ "--h": height, "--delay": `${index * 0.08}s` } as CSSProperties}
            />
            <span
              className={styles.barBooking}
              style={{ "--h": height * 0.55, "--delay": `${index * 0.08 + 0.2}s` } as CSSProperties}
            />
          </span>
        ))}
      </div>
      <ul className={styles.chartLegend}>
        <li>
          <span className={styles.swatchSearch} aria-hidden />
          {visual.legend[0]}
        </li>
        <li>
          <span className={styles.swatchBooking} aria-hidden />
          {visual.legend[1]}
        </li>
      </ul>
    </div>
  );
}

function CardVisual({ card }: { card: Card }): ReactNode {
  switch (card.id) {
    case "maps":
      return <MapsVisual visual={card.visual} />;
    case "ai-search":
      return <AiSearchVisual visual={card.visual} />;
    case "score":
      return <ScoreVisual visual={card.visual} />;
    case "opportunities":
      return <OpportunitiesVisual visual={card.visual} />;
    case "content":
      return <ContentVisual visual={card.visual} />;
    case "reviews":
      return <ReviewsVisual visual={card.visual} />;
    case "bookings":
      return <BookingsVisual visual={card.visual} />;
  }
}

function trackGlow(event: PointerEvent<HTMLElement>) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  card.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

export function FeatureGrid({ copy }: { copy: GridCopy }) {
  const gridRef = useRef<HTMLUListElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className={styles.section} aria-labelledby="features-heading">
      <DotField />
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="features-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.lead}>{copy.intro}</p>
      </div>

      <ul ref={gridRef} className={styles.grid} data-visible={isVisible}>
        {copy.cards.map((card, index) => {
          const Icon = cardIcons[card.id];
          return (
            <li
              key={card.id}
              className={styles.card}
              data-card={card.id}
              style={{ "--enter": `${index * 0.08}s` } as CSSProperties}
              onPointerMove={trackGlow}
            >
              <div className={styles.visual}>
                <CardVisual card={card} />
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardIcon}>
                  <Icon aria-hidden size={18} />
                </span>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
