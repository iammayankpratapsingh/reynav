import "server-only";
// Exports the current growth score version and its version id.
export { growthScoreV1 as growthScore, DEFAULT_WEIGHTS, VERSION } from "./v1";
export type { GrowthScoreInput, GrowthScoreWeights } from "./v1";
