// Locations: the list for the switcher and the combined view across all of them.

export type LocationOption = { id: string; label: string };

export type LocationSummary = {
  id: string;
  label: string;
  isActive: boolean;
  lastScanAt: string | null;
  growth: number | null;
  /** Change against that location's previous completed scan. */
  growthDelta: number | null;
  subScores: { key: string; value: number }[];
  topOpportunity: string | null;
};

export type LocationsOverview = {
  locations: LocationSummary[];
  /** Average Growth Score across locations that have one. */
  averageGrowth: number | null;
};
