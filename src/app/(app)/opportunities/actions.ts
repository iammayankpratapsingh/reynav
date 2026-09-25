"use server";
// Ticking a recommended action off. Authenticate, validate, call one service method, return the new state.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import * as opportunityService from "@/backend/services/opportunity-service";
import { isAppError } from "@/shared/errors";
import type { OpportunityDetail } from "@/shared/types/opportunity";

const ToggleSchema = z.object({
  opportunityId: z.string().min(1).max(200),
  actionId: z.string().min(1).max(200),
  done: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type ToggleActionState = { detail: OpportunityDetail | null; error: string | null };

export async function toggleActionAction(
  _previous: ToggleActionState,
  formData: FormData,
): Promise<ToggleActionState> {
  const ctx = await requireTenant();
  const parsed = ToggleSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    actionId: formData.get("actionId"),
    done: formData.get("done"),
  });
  if (!parsed.success) return { detail: null, error: "That action could not be updated." };

  try {
    const detail = await opportunityService.setActionDone(
      ctx,
      parsed.data.opportunityId,
      parsed.data.actionId,
      parsed.data.done,
    );
    revalidatePath(`/opportunities/${parsed.data.opportunityId}`);
    return { detail, error: null };
  } catch (error) {
    if (isAppError(error)) return { detail: null, error: error.userMessage };
    throw error;
  }
}
