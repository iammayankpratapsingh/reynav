import "server-only";
// Factory selecting the ConnectionAuthorizer from config.
import { config } from "@/backend/config";
import { MockConnectionAuthorizer } from "./mock";
import { OAuthConnectionAuthorizer } from "./oauth";
import type { ConnectionAuthorizer } from "./types";

export function getConnectionAuthorizer(): ConnectionAuthorizer {
  if (config.useMockData) return new MockConnectionAuthorizer();
  return new OAuthConnectionAuthorizer();
}

/** True while connections are simulated, so the UI can say so instead of implying a real account is linked. */
export function isSimulatedConnection(): boolean {
  return config.useMockData;
}
