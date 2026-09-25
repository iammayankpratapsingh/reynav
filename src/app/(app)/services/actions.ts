"use server";
// Saving a service's economics. Authenticate, call one service method, return the recalculated board.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import * as serviceIntelligence from "@/backend/services/service-intelligence-service";
import { isAppError } from "@/shared/errors";
import type { ServiceBoard } from "@/shared/types/service-intelligence";

export type SaveEconomicsResult = { board: ServiceBoard; error: null } | { board: null; error: string };

export async function saveEconomicsAction(input: unknown): Promise<SaveEconomicsResult> {
  const ctx = await requireTenant();
  try {
    const board = await serviceIntelligence.saveEconomics(ctx, input);
    revalidatePath("/services");
    return { board, error: null };
  } catch (error) {
    if (isAppError(error)) return { board: null, error: error.userMessage };
    if (error instanceof z.ZodError) return { board: null, error: error.issues[0]?.message ?? "Check the numbers." };
    throw error;
  }
}
