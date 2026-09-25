// Weekly report domain types.
import type { Range } from "./range";

export type ReportHighlight = {
  label: string;
  /** Already formatted for display, because what a figure means varies by row. */
  value: string;
  delta: number | null;
};

export type Report = {
  id: string;
  /** The week or month the report covers, already formatted. */
  periodLabel: string;
  generatedAt: string;
  growthScore: number | null;
  growthDelta: number | null;
  highlights: ReportHighlight[];
  /** Headline opportunity titles this period. */
  topOpportunities: string[];
  estimatedMonthlyBookings: Range | null;
};

export type ReportBoard = {
  reports: Report[];
  /** True when reports are produced from completed scans rather than scheduled sends. */
  isDerivedFromScans: boolean;
};
