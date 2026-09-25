import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockSearchDemand } from "./mock";
import type { SearchDemandProvider } from "./types";

export function getSearchDemandProvider(): SearchDemandProvider {
  if (config.useMockData) return new MockSearchDemand();
  throw new ConfigError("No SearchDemandProvider implementation is wired yet; set USE_MOCK_DATA=true");
}
