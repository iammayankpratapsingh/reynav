import "server-only";
// Factory: picks the implementation from config. One instance per process so registrations survive.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockJobRunner } from "./mock";
import type { JobRunner } from "./types";

const globalForRunner = globalThis as typeof globalThis & { __reynavJobRunner?: JobRunner };

function create(): JobRunner {
  if (config.useMockData) return new MockJobRunner();
  throw new ConfigError("No JobRunner implementation is wired yet; set USE_MOCK_DATA=true");
}

export function getJobRunner(): JobRunner {
  return (globalForRunner.__reynavJobRunner ??= create());
}
