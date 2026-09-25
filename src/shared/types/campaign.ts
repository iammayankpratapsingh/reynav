// Campaign domain types.
import type { ImpactTier } from "./opportunity";

export const CAMPAIGN_STATES = ["recommended", "active", "past"] as const;

export type CampaignState = (typeof CAMPAIGN_STATES)[number];

export type Campaign = {
  id: string;
  name: string;
  summary: string;
  /** What the campaign is made of, e.g. "3 Google posts". */
  pieces: readonly string[];
  /** Who it is aimed at, from the vertical pack's segments. */
  segmentName: string;
  impact: ImpactTier;
  state: CampaignState;
  /** A tint name the UI maps to a gradient; the product ships no stock photography. */
  theme: string;
  /** Set once a campaign is running. */
  launchedAt: string | null;
};

export type CampaignBoard = {
  recommended: Campaign[];
  active: Campaign[];
  past: Campaign[];
};
