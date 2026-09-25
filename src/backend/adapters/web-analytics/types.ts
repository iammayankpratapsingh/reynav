import "server-only";
// WebAnalyticsSource: how many people visit and how they behave.

export type AnalyticsSnapshot = {
  sessions: number;
  /** Share of sessions that leave without an interaction, 0–1. */
  bounceRate: number;
  source: string;
  fetchedAt: Date;
};

export interface WebAnalyticsSource {
  getSnapshot(input: { propertyRef: string; days: number }): Promise<AnalyticsSnapshot>;
}
