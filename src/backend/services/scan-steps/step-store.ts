import "server-only";
// Per-scan signal store. Steps write the raw signals they collected; later steps read them.
// Kept small on purpose: the job runner only ever carries ids, never this payload.
import type { AnalyticsSnapshot } from "@/backend/adapters/web-analytics/types";
import type { BookingSummary } from "@/backend/adapters/booking-source/types";
import type { AiMention } from "@/backend/adapters/ai-visibility/types";
import type { Competitor } from "@/backend/adapters/competitor-directory/types";
import type { CrawlResult } from "@/backend/adapters/web-crawler/types";
import type { KeywordRanking } from "@/backend/adapters/rank-tracker/types";
import type { KeywordVolume } from "@/backend/adapters/search-demand/types";
import type { ListingSnapshot, ReviewFeed } from "@/backend/adapters/local-listing/types";
import type { SearchPerformanceSnapshot } from "@/backend/adapters/search-performance/types";

export type ScanSignals = {
  crawl?: CrawlResult;
  listing?: ListingSnapshot;
  rankings?: KeywordRanking[];
  volumes?: KeywordVolume[];
  mentions?: AiMention[];
  analytics?: AnalyticsSnapshot;
  bookings?: BookingSummary;
  competitors?: Competitor[];
  reviews?: ReviewFeed;
  searchPerformance?: SearchPerformanceSnapshot;
};

const globalForSignals = globalThis as typeof globalThis & { __reynavSignals?: Map<string, ScanSignals> };
const store: Map<string, ScanSignals> = (globalForSignals.__reynavSignals ??= new Map());

export function readSignals(scanId: string): ScanSignals {
  return store.get(scanId) ?? {};
}

export function writeSignals(scanId: string, patch: ScanSignals): void {
  store.set(scanId, { ...readSignals(scanId), ...patch });
}

export function clearSignals(scanId: string): void {
  store.delete(scanId);
}
