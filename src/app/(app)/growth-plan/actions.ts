"use server";
// Ticking a growth-plan task. Authenticate, validate, call one service method, return the plan.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import * as growthPlanService from "@/backend/services/growth-plan-service";
import { isAppError } from "@/shared/errors";
import type { GrowthPlan } from "@/shared/types/growth-plan";

const ToggleSchema = z.object({ taskId: z.string().min(1).max(200), done: z.boolean() });

export type TogglePlanTaskResult = { plan: GrowthPlan | null; error: string | null };

export async function togglePlanTaskAction(input: unknown): Promise<TogglePlanTaskResult> {
  const ctx = await requireTenant();
  const parsed = ToggleSchema.safeParse(input);
  if (!parsed.success) return { plan: null, error: "That task could not be updated." };
  try {
    const plan = await growthPlanService.setTaskDone(ctx, parsed.data.taskId, parsed.data.done);
    revalidatePath("/growth-plan");
    return { plan, error: null };
  } catch (error) {
    if (isAppError(error)) return { plan: null, error: error.userMessage };
    throw error;
  }
}
