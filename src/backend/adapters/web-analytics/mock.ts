import "server-only";
// Mock WebAnalyticsSource: a steady month of traffic.
import type { AnalyticsSnapshot, WebAnalyticsSource } from "./types";

export class MockWebAnalytics implements WebAnalyticsSource {
  async getSnapshot(): Promise<AnalyticsSnapshot> {
    return { sessions: 2840, bounceRate: 0.34, source: "mock", fetchedAt: new Date() };
  }
}
