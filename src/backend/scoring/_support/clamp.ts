// Shared helpers for scoring. Pure: no I/O, no clock, no imports beyond shared types.

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Maps a value onto 0–100 between a floor and a ceiling, clamping outside them. */
export function scaleBetween(value: number, floor: number, ceiling: number): number {
  if (ceiling === floor) return 0;
  return clampScore(((value - floor) / (ceiling - floor)) * 100);
}

/** Averages parts that are each already 0–100. */
export function weightedAverage(parts: readonly { value: number; weight: number }[]): number {
  const total = parts.reduce((sum, part) => sum + part.weight, 0);
  if (total === 0) return 0;
  return clampScore(parts.reduce((sum, part) => sum + part.value * part.weight, 0) / total);
}
