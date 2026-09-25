// Estimates are always a range, never a single figure, and the UI labels them as estimates.
export type Range = { low: number; high: number };

export function rangeAround(value: number, spread: number): Range {
  return { low: Math.max(0, Math.round(value * (1 - spread))), high: Math.round(value * (1 + spread)) };
}
