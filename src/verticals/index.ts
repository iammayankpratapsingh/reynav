// Vertical registry and getVertical(verticalId).
import type { VerticalPack } from "@/shared/types/vertical";
import { salonPack } from "./salon";

const packs: Record<string, VerticalPack> = {
  [salonPack.manifest.id]: salonPack,
};

export const featuredVerticalId = salonPack.manifest.id;

export function getVertical(verticalId: string): VerticalPack {
  const pack = packs[verticalId];
  if (!pack) throw new Error(`Unknown vertical: ${verticalId}`);
  return pack;
}
