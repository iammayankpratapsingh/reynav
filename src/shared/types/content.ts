// Content catalogue domain types.
import type { ContentChannel, VerticalContentType } from "./vertical";

export type ContentTemplate = VerticalContentType & {
  /** True when an opportunity from the latest scan maps to this piece. */
  isSuggested: boolean;
  /** The opportunity that asked for it, when there is one. */
  suggestedFor: string | null;
};

export type ContentCatalogue = {
  channels: readonly ContentChannel[];
  templates: ContentTemplate[];
  suggestedCount: number;
};
