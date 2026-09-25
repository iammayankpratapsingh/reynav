import "server-only";
// Factory selecting the FileStorage from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockFileStorage } from "./mock";
import type { FileStorage } from "./types";

export function getFileStorage(): FileStorage {
  if (config.useMockData) return new MockFileStorage();
  throw new ConfigError("No FileStorage implementation is wired yet; set USE_MOCK_DATA=true");
}
