import "server-only";
// Job event names and their payloads. Payloads carry ids only.

export const SCAN_REQUESTED = "scan/requested";

export type ScanRequestedPayload = {
  organizationId: string;
  userId: string;
  role: string;
  scanId: string;
  locationId: string;
};
