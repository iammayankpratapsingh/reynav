// Salon pack: keyword templates.
import type { VerticalKeywords } from "@/shared/types/vertical";

export const keywords: VerticalKeywords = {
  /** {service} and {city} are filled in from the business's services and location. */
  templates: ["{service} {city}", "{service} near me"],
  /** Searches that describe the business itself rather than one service. */
  brandTemplates: ["{business} {city}"],
  /** Questions put to AI assistants to see whether the business gets named. */
  aiPromptTemplates: [
    "What is the best {business} in {city}?",
    "Where should I go for {service} in {city}?",
    "Recommend a highly rated {business} near {city}",
  ],
};
