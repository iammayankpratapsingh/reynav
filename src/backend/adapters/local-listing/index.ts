import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockLocalListing } from "./mock";
import type { LocalListingSource } from "./types";

export function getLocalListingSource(): LocalListingSource {
  if (config.useMockData) return new MockLocalListing();
  throw new ConfigError("No LocalListingSource implementation is wired yet; set USE_MOCK_DATA=true");
}
