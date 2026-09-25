import "server-only";
// AiVisibilityProvider: what AI assistants answer when someone asks for a local recommendation.
import { AI_SURFACES, type AiSurface } from "@/shared/types/ai-search";

/** Where the answer was read: Google's AI Overview, or a chat assistant answering the same question. */
export { AI_SURFACES, type AiSurface };

export type AiMention = {
  prompt: string;
  surface: AiSurface;
  wasMentioned: boolean;
  /** Position within the answer's list of businesses, 1-based, or null when not named. */
  position: number | null;
  /** How many businesses the answer named. */
  namedCount: number;
  source: string;
  fetchedAt: Date;
};

export interface AiVisibilityProvider {
  /** One result per prompt per surface. */
  getMentions(input: { prompts: readonly string[]; businessName: string }): Promise<AiMention[]>;
}
