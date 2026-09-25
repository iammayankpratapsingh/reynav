import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockAiVisibility } from "./mock";
import type { AiVisibilityProvider } from "./types";

export function getAiVisibilityProvider(): AiVisibilityProvider {
  if (config.useMockData) return new MockAiVisibility();
  throw new ConfigError("No AiVisibilityProvider implementation is wired yet; set USE_MOCK_DATA=true");
}
