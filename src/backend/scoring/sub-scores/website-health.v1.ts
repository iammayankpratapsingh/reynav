// How well the website serves both a visitor and a search engine.
import { scaleBetween, weightedAverage } from "../_support/clamp";

export const VERSION = "websiteHealth.v1";

export type WebsiteHealthInput = {
  /** Largest Contentful Paint in milliseconds. */
  loadMs: number;
  isMobileFriendly: boolean;
  hasBookingLinkAboveFold: boolean;
  /** Pages dedicated to a single service. */
  servicePageCount: number;
  /** Pages missing a title or meta description. */
  pagesMissingMetadata: number;
  totalPages: number;
  hasStructuredData: boolean;
  benchmarks: {
    /** Load time at or under which the site scores full marks. */
    fastLoadMs: number;
    /** Load time at or over which it scores nothing. */
    slowLoadMs: number;
    servicePageTarget: number;
  };
};

export function websiteHealthV1(input: WebsiteHealthInput): number {
  const { benchmarks } = input;
  const speed = scaleBetween(benchmarks.slowLoadMs - input.loadMs, 0, benchmarks.slowLoadMs - benchmarks.fastLoadMs);
  const metadata =
    input.totalPages === 0 ? 0 : scaleBetween(input.totalPages - input.pagesMissingMetadata, 0, input.totalPages);

  return weightedAverage([
    { value: speed, weight: 3 },
    { value: scaleBetween(input.servicePageCount, 0, benchmarks.servicePageTarget), weight: 3 },
    { value: metadata, weight: 2 },
    { value: input.isMobileFriendly ? 100 : 0, weight: 2 },
    { value: input.hasBookingLinkAboveFold ? 100 : 0, weight: 2 },
    { value: input.hasStructuredData ? 100 : 0, weight: 1 },
  ]);
}
