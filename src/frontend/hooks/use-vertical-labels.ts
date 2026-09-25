"use client";
// Hook returning the current vertical's display labels from context.
import { useContext } from "react";
import { VerticalLabelsContext } from "@/frontend/providers/vertical-labels-provider";
import type { VerticalLabels } from "@/shared/types/vertical";

export function useVerticalLabels(): VerticalLabels {
  const labels = useContext(VerticalLabelsContext);
  if (!labels) throw new Error("useVerticalLabels must be used inside VerticalLabelsProvider");
  return labels;
}
