// What the dashboard shows, including while a scan is still running.
import type { ScanStepId, ScanStepStatus } from "@/shared/constants/scan-steps";
import type { Opportunity } from "./opportunity";
import type { ScoreSet } from "./score";
import type { ScanStatus } from "./scan";

export type ScanProgress = {
  scanId: string;
  status: ScanStatus;
  steps: { step: ScanStepId; status: ScanStepStatus; retryCount: number }[];
  /** 0–100, from how many steps have finished. */
  percentComplete: number;
};

/**
 * Every part is filled in as its step finishes, so the screen can show what has arrived and keep waiting
 * for the rest. `null` means "not in yet", not "zero".
 */
export type DashboardData = {
  organizationName: string;
  locationLabel: string;
  scan: ScanProgress | null;
  scores: ScoreSet;
  opportunities: Opportunity[];
  /** Growth Score of each completed scan, oldest first, for the history chart. */
  history: ScoreHistoryPoint[];
  /** Three things to do today, picked from the open actions of the top opportunities. */
  recommendedToday: RecommendedAction[];
  /** ISO 8601 time of the next weekly re-scan, or null before the first scan. */
  nextScanAt: string | null;
  /** True once nothing else is coming, whether it finished or failed. */
  isComplete: boolean;
};

export type ScoreHistoryPoint = {
  scanId: string;
  /** ISO 8601. */
  at: string;
  growth: number;
};

export type RecommendedAction = {
  opportunityId: string;
  opportunityTitle: string;
  actionId: string;
  label: string;
  effort: "quick" | "medium" | "project";
};

/** One sub-score with its movement since the previous completed scan. */
export type SubScoreTrend = {
  key: import("./score").SubScoreKey;
  value: number;
  previousValue: number | null;
  delta: number | null;
  /** How much this part counts toward the Growth Score, from the formula's weights. */
  weight: number;
  version: string;
};

export type ScanHistoryEntry = {
  scanId: string;
  status: import("./scan").ScanStatus;
  startedAt: string;
  finishedAt: string | null;
  growth: number | null;
};

export type ScoreDetail = {
  growth: import("./score").GrowthScore | null;
  subScores: SubScoreTrend[];
  history: ScanHistoryEntry[];
};
