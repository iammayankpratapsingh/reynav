import "server-only";
// Step: combine the sub-scores into the Growth Score, and record the change since the last scan.
import * as scoresRepository from "@/backend/db/repositories/scores";
import { DEFAULT_WEIGHTS, growthScore, VERSION } from "@/backend/scoring/growth-score";
import { ValidationError } from "@/shared/errors";
import { SUB_SCORE_KEYS, type SubScoreKey } from "@/shared/types/score";
import type { ScanContext } from "./scan-context";

export async function computeScores(scan: ScanContext): Promise<void> {
  const stored = await scoresRepository.listForScan(scan.tenant, scan.scanId);
  const subScores = stored
    .filter((score): score is typeof score & { key: SubScoreKey } =>
      (SUB_SCORE_KEYS as readonly string[]).includes(score.key),
    )
    .map((score) => ({ key: score.key, value: score.value }));

  const value = growthScore({ subScores, weights: DEFAULT_WEIGHTS });
  if (value === null) {
    throw new ValidationError("Growth Score needs every sub-score", "Some signals could not be collected.");
  }

  // The change against the previous scan is derived when the dashboard reads it, never stored twice.
  await scoresRepository.put(scan.tenant, scan.scanId, { key: "growth", value, version: VERSION });
}
