"use client";
// Client context provider seeded server-side with the vertical pack's labels.
import { createContext, type ReactNode } from "react";
import type { VerticalLabels } from "@/shared/types/vertical";

export const VerticalLabelsContext = createContext<VerticalLabels | null>(null);

export function VerticalLabelsProvider({ labels, children }: { labels: VerticalLabels; children: ReactNode }) {
  return <VerticalLabelsContext.Provider value={labels}>{children}</VerticalLabelsContext.Provider>;
}
