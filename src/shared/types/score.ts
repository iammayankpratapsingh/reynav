// Score domain types. Every number here came from a pure function in backend/scoring, never from a model.

/** The parts of the presence a Growth Score is built from. */
export const SUB_SCORE_KEYS = ["visibility", "maps", "website", "ai-search", "reviews", "conversion"] as const;

export type SubScoreKey = (typeof SUB_SCORE_KEYS)[number];

export type SubScore = {
  key: SubScoreKey;
  /** 0–100. */
  value: number;
  /** The formula that produced it, e.g. "searchVisibility.v1". Stored so a formula change never rewrites history. */
  version: string;
  /** The same part in the previous completed scan, or null when there is nothing to compare with. */
  previousValue: number | null;
};

export type GrowthScore = {
  /** 0–100. */
  value: number;
  /** Change against the previous scan, or null when there is nothing to compare with. */
  deltaVsPrevious: number | null;
  version: string;
};

export type ScoreSet = {
  growth: GrowthScore | null;
  subScores: SubScore[];
};
