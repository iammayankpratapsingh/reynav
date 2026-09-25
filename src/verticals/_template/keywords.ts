// Template pack: keyword templates. {service}, {city} and {business} are filled in per business.
import type { VerticalKeywords } from "@/shared/types/vertical";

export const keywords: VerticalKeywords = {
  templates: ["{service} {city}", "{service} near me"],
  brandTemplates: ["{business} {city}"],
  aiPromptTemplates: ["What is the best {business} in {city}?"],
};
