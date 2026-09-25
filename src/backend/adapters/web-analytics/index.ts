import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockWebAnalytics } from "./mock";
import type { WebAnalyticsSource } from "./types";

export function getWebAnalyticsSource(): WebAnalyticsSource {
  if (config.useMockData) return new MockWebAnalytics();
  throw new ConfigError("No WebAnalyticsSource implementation is wired yet; set USE_MOCK_DATA=true");
}
