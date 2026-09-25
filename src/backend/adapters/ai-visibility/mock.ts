import "server-only";
// Mock AiVisibilityProvider: named in the obvious prompts, absent from the specific ones. Deterministic by prompt order.
// Every other call is rate-limited, the way AI answer providers throttle, so the scan's retry path is exercised.
import { RateLimitedError } from "@/shared/errors";
import { AI_SURFACES, type AiMention, type AiVisibilityProvider } from "./types";

let callCount = 0;

const answers: readonly { position: number | null; namedCount: number }[] = [
  { position: 2, namedCount: 5 },
  { position: 9, namedCount: 10 },
  { position: 6, namedCount: 8 },
  { position: null, namedCount: 9 },
  { position: null, namedCount: 6 },
  { position: 7, namedCount: 9 },
  { position: null, namedCount: 7 },
];

export class MockAiVisibility implements AiVisibilityProvider {
  async getMentions({ prompts }: { prompts: readonly string[] }): Promise<AiMention[]> {
    callCount += 1;
    if (callCount % 2 === 1) throw new RateLimitedError("Mock AI visibility provider throttled the request", 1500);
    const fetchedAt = new Date();
    // AI Overviews name fewer businesses than chat assistants, so the same prompt lands differently on each.
    return prompts.flatMap((prompt, index) =>
      AI_SURFACES.map((surface, offset) => {
        const answer = answers[(index + offset * 3) % answers.length]!;
        return {
          prompt,
          surface,
          wasMentioned: answer.position !== null,
          position: answer.position,
          namedCount: answer.namedCount,
          source: "mock",
          fetchedAt,
        };
      }),
    );
  }
}
