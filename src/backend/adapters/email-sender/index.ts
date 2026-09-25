import "server-only";
// Factory selecting the EmailSender from config.
import { config } from "@/backend/config";
import { ConfigError } from "@/shared/errors";
import { MockEmailSender } from "./mock";
import type { EmailSender } from "./types";

export function getEmailSender(): EmailSender {
  if (config.useMockData) return new MockEmailSender();
  throw new ConfigError("No EmailSender implementation is wired yet; set USE_MOCK_DATA=true");
}

/** True while email is simulated, so the UI can say nothing was really sent. */
export function isSimulatedEmail(): boolean {
  return config.useMockData;
}
