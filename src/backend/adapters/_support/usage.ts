import "server-only";
// UsageSink interface adapters report cost/usage to; the caller persists it (adapters never touch the DB).

export type UsageRecord = {
  provider: string;
  operation: string;
  /** Whatever the provider bills in: calls, credits, rows. */
  units: number;
  estimatedCostCents: number;
};

export interface UsageSink {
  record(entry: UsageRecord): void;
}

/** Mocks make no billable call, so this is what they report to. */
export const noopUsageSink: UsageSink = { record: () => {} };
