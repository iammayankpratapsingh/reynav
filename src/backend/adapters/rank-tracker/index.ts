import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockRankTracker } from "./mock";
import type { RankTracker } from "./types";

export function getRankTracker(): RankTracker {
  if (config.useMockData) return new MockRankTracker();
  throw new ConfigError("No RankTracker implementation is wired yet; set USE_MOCK_DATA=true");
}
