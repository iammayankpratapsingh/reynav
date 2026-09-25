"use client";
// Reviews: the headline numbers, a per-service breakdown, then the feed with suggested replies.
import { MessageSquare, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import { TabNav } from "@/frontend/components/app/tab-nav";
import type { ReviewsCopy } from "@/frontend/copy/reviews";
import type { Review, ReviewBoard as Board } from "@/shared/types/review";
import data from "@/frontend/components/app/data.module.css";
import styles from "./review-board.module.css";

const MAX_RATING = 5;

export function ReviewBoard({ board, copy }: { board: Board; copy: ReviewsCopy }) {
  const [tab, setTab] = useState("recent");

  if (board.reviews.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState
          icon={<MessageSquare aria-hidden size={26} />}
          heading={copy.empty.heading}
          body={copy.empty.body}
          cta={copy.empty.cta}
        />
      </div>
    );
  }

  const awaiting = board.reviews.filter((review) => review.reply === null);
  const shown =
    tab === "unanswered"
      ? awaiting
      : tab === "negative"
        ? board.reviews.filter((review) => review.sentiment === "negative")
        : board.reviews;
  const totalTone = board.sentiment.positive + board.sentiment.neutral + board.sentiment.negative;
  const maxCount = Math.max(...board.byService.map((row) => row.reviewCount), 1);

  return (
    <div className={styles.page}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.ratingRow}>
            <p className={styles.ratingValue}>{board.summary.averageRating.toFixed(1)}</p>
            <Stars rating={board.summary.averageRating} label={copy.review.ratingLabel} />
          </div>
          <p className={styles.summaryLabel}>{copy.summary.rating}</p>
        </div>

        <div className={styles.summaryCard}>
          <p className={styles.summaryValue}>{board.summary.totalReviews.toLocaleString("en-CA")}</p>
          <p className={styles.summaryLabel}>{copy.summary.total}</p>
        </div>

        <div className={styles.summaryCard}>
          <p className={`${styles.summaryValue} ${styles.positive}`}>
            {board.summary.growthPercent >= 0 ? "+" : ""}
            {board.summary.growthPercent}%
          </p>
          <p className={styles.summaryLabel}>{copy.summary.growth}</p>
        </div>

        <div className={styles.summaryCard}>
          <p className={styles.summaryValue}>{Math.round(board.summary.replyRate * 100)}%</p>
          <p className={styles.summaryLabel}>{copy.summary.replyRate}</p>
        </div>
      </div>

      <Panel title={copy.byService.heading}>
        {board.byService.length === 0 ? (
          <p className={styles.muted}>{copy.byService.empty}</p>
        ) : (
          <ul className={styles.serviceList}>
            {board.byService.map((row) => (
              <li key={row.serviceSlug} className={styles.serviceRow}>
                <span className={styles.serviceName}>{row.serviceName}</span>
                <span className={styles.track}>
                  <span
                    className={styles.fill}
                    style={{ width: `${Math.round((row.reviewCount / maxCount) * 100)}%` }}
                  />
                </span>
                <span className={styles.serviceScore}>
                  <strong>{row.averageRating.toFixed(1)}</strong>
                  <span className={styles.serviceCount}>({row.reviewCount})</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className={data.grid2}>
        <Panel title={copy.insights.sentimentHeading}>
          <ul className={data.list}>
            {(["positive", "neutral", "negative"] as const).map((tone) => (
              <li key={tone} className={data.listItem}>
                <p className={data.listTitle}>{copy.insights.sentiment[tone]}</p>
                <span className={styles.toneRow}>
                  <span className={data.meter} aria-hidden>
                    <span
                      className={data.meterFill}
                      data-tone={tone === "positive" ? "good" : tone === "negative" ? "bad" : undefined}
                      style={{
                        width: `${totalTone === 0 ? 0 : Math.round((board.sentiment[tone] / totalTone) * 100)}%`,
                      }}
                    />
                  </span>
                  <strong>{board.sentiment[tone]}</strong>
                </span>
              </li>
            ))}
          </ul>
          <h3 className={styles.subheading}>{copy.insights.topicsHeading}</h3>
          {board.topics.length === 0 ? (
            <p className={styles.muted}>{copy.insights.topicsEmpty}</p>
          ) : (
            <ul className={data.list}>
              {board.topics.map((topic) => (
                <li key={topic.id} className={data.listItem}>
                  <p className={data.listTitle}>{topic.name}</p>
                  <span className={data.listSub}>
                    {copy.insights.topicLine
                      .replace("{mentions}", String(topic.mentions))
                      .replace("{positive}", String(topic.positive))
                      .replace("{negative}", String(topic.negative))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className={styles.stack}>
          <Panel title={copy.insights.staffHeading}>
            {board.byStaff.length === 0 ? (
              <p className={styles.muted}>{copy.insights.staffEmpty}</p>
            ) : (
              <ul className={data.list}>
                {board.byStaff.map((row) => (
                  <li key={row.staffName} className={data.listItem}>
                    <p className={data.listTitle}>{row.staffName}</p>
                    <span className={styles.serviceScore}>
                      <strong>{row.averageRating.toFixed(1)} ★</strong>
                      <span className={styles.serviceCount}>
                        ({row.reviewCount} {copy.insights.staffCount})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={copy.insights.lowHeading}>
            <p className={data.intro}>{copy.insights.lowIntro}</p>
            {board.lowReviewServices.length === 0 ? (
              <p className={styles.muted}>{copy.insights.lowEmpty}</p>
            ) : (
              <ul className={data.list}>
                {board.lowReviewServices.map((row) => (
                  <li key={row.serviceName} className={data.listItem}>
                    <div>
                      <p className={data.listTitle}>{row.serviceName}</p>
                      {row.monthlySearches !== null && (
                        <p className={data.listSub}>
                          {row.monthlySearches.toLocaleString("en-CA")} {copy.insights.lowSearches}
                        </p>
                      )}
                    </div>
                    <span className={data.chip} data-tone="warn">
                      {copy.insights.lowCount.replace("{count}", String(row.reviewCount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <TabNav tabs={copy.tabs} active={tab} onChange={setTab} label={copy.title} />

      <p className={styles.awaiting}>
        {awaiting.length === 0 ? copy.review.allAnswered : `${awaiting.length} ${copy.review.awaitingSuffix}`}
      </p>

      <ul id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className={styles.feed}>
        {shown.length === 0 && <li className={styles.muted}>{copy.insights.noneInTab}</li>}
        {shown.map((review) => (
          <ReviewCard key={review.id} review={review} copy={copy} showSuggestion={tab !== "recent"} />
        ))}
      </ul>

      <p className={styles.note}>{copy.review.notWired}</p>
    </div>
  );
}

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <span className={styles.stars} role="img" aria-label={`${rating.toFixed(1)} ${label}`}>
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const filled = rating - index;
        return (
          <Star
            key={index}
            aria-hidden
            size={19}
            className={filled >= 0.75 ? styles.starFull : filled >= 0.25 ? styles.starHalf : styles.starEmpty}
          />
        );
      })}
    </span>
  );
}

function ReviewCard({ review, copy, showSuggestion }: { review: Review; copy: ReviewsCopy; showSuggestion: boolean }) {
  const posted = new Date(review.postedAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.avatar} aria-hidden>
          {review.authorName.slice(0, 1)}
        </span>
        <div className={styles.cardWho}>
          <p className={styles.author}>{review.authorName}</p>
          <p className={styles.cardMeta}>
            <Stars rating={review.rating} label={copy.review.ratingLabel} />
            <span>{posted}</span>
            {review.serviceName && <span className={styles.serviceTag}>{review.serviceName}</span>}
            {review.staffName && <span className={styles.serviceTag}>{review.staffName}</span>}
          </p>
        </div>
        {review.reply && <span className={styles.repliedFlag}>{copy.review.replied}</span>}
      </div>

      <p className={styles.text}>{review.text}</p>
      {review.topics.length > 0 && (
        <ul className={data.chips} aria-label="Topics">
          <li
            className={data.chip}
            data-tone={review.sentiment === "positive" ? "good" : review.sentiment === "negative" ? "bad" : undefined}
          >
            {copy.insights.sentiment[review.sentiment]}
          </li>
          {review.topics.map((topic) => (
            <li key={topic} className={data.chip}>
              {topic}
            </li>
          ))}
        </ul>
      )}

      {review.reply ? (
        <div className={styles.reply}>
          <p className={styles.replyLabel}>{copy.review.yourReply}</p>
          <p className={styles.replyText}>{review.reply}</p>
        </div>
      ) : showSuggestion && review.suggestedReply ? (
        <div className={`${styles.reply} ${styles.suggestion}`}>
          <p className={styles.replyLabel}>
            <Sparkles aria-hidden size={14} />
            {copy.review.suggestedReply}
          </p>
          <p className={styles.replyText}>{review.suggestedReply}</p>
          <div className={styles.replyActions}>
            <button type="button" className={styles.primaryAction}>
              {copy.review.use}
            </button>
            <button type="button" className={styles.secondaryAction}>
              {copy.review.edit}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <button type="button" className={styles.primaryAction}>
            {copy.review.generate}
          </button>
          <button type="button" className={styles.secondaryAction}>
            {copy.review.reply}
          </button>
        </div>
      )}
    </li>
  );
}
