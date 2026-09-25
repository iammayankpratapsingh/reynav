import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockCompetitorDirectory } from "./mock";
import type { CompetitorDirectory } from "./types";

export function getCompetitorDirectory(): CompetitorDirectory {
  if (config.useMockData) return new MockCompetitorDirectory();
  throw new ConfigError("No CompetitorDirectory implementation is wired yet; set USE_MOCK_DATA=true");
}
