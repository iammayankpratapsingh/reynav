import "server-only";
// Factory selecting the SearchPerformanceSource from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockSearchPerformance } from "./mock";
import type { SearchPerformanceSource } from "./types";

export function getSearchPerformanceSource(): SearchPerformanceSource {
  if (config.useMockData) return new MockSearchPerformance();
  throw new ConfigError("No SearchPerformanceSource implementation is wired yet; set USE_MOCK_DATA=true");
}
