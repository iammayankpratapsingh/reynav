// Scan domain types.
export const SCAN_STATUSES = ["queued", "running", "done", "failed"] as const;

export type ScanStatus = (typeof SCAN_STATUSES)[number];

export type Scan = {
  id: string;
  organizationId: string;
  locationId: string;
  status: ScanStatus;
  startedAt: string; // ISO 8601
  finishedAt: string | null;
};
