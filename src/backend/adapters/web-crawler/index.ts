import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockWebCrawler } from "./mock";
import type { WebCrawler } from "./types";

export function getWebCrawler(): WebCrawler {
  if (config.useMockData) return new MockWebCrawler();
  throw new ConfigError("No WebCrawler implementation is wired yet; set USE_MOCK_DATA=true");
}
