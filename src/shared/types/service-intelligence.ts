// Service intelligence: every service with its demand, competition, the owner's economics and a live score.
import type { Range } from "./range";

export type Level = "high" | "medium" | "low";

/** What the scan measured for one service. Stored per scan. */
export type ServiceMetrics = {
  serviceSlug: string;
  serviceName: string;
  monthlySearches: number | null;
  organicPosition: number | null;
  mapPosition: number | null;
  competitorsOffering: number;
  totalCompetitors: number;
  /** Rivals that show above the business on the map for this service. */
  competitorsAhead: number;
  reviewCount: number;
  hasServicePage: boolean;
};

/** What the owner told us about a service. Defaults come from the vertical pack until they do. */
export type ServiceEconomics = {
  averagePrice: number;
  durationMinutes: number;
  marginPercent: number;
  isOwnerEntered: boolean;
};

export const SERVICE_EVIDENCE = ["no-page", "few-reviews", "low-rank", "not-on-maps", "competitors-ahead"] as const;

export type ServiceEvidence = (typeof SERVICE_EVIDENCE)[number];

export type ServiceInsight = ServiceMetrics & {
  demand: Level;
  competition: Level;
  economics: ServiceEconomics;
  /** 0–100 from backend/scoring/service-opportunity; recalculated whenever the owner changes economics. */
  opportunityScore: number;
  scoreVersion: string;
  /** Extra profit a month if the service reached the target position, always a range. */
  estimatedMonthlyProfit: Range | null;
  isUnderMarketed: boolean;
  evidence: ServiceEvidence[];
};

export type ServiceBoard = {
  scanId: string | null;
  scannedAt: string | null;
  services: ServiceInsight[];
};
