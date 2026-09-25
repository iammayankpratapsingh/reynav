import "server-only";
// Factory: picks the implementation from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockBookingSource } from "./mock";
import type { BookingSource } from "./types";

export function getBookingSource(): BookingSource {
  if (config.useMockData) return new MockBookingSource();
  throw new ConfigError("No BookingSource implementation is wired yet; set USE_MOCK_DATA=true");
}
