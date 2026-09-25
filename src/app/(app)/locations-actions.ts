"use server";
// Location switching and adding. Authenticate, validate, call one service method, send the owner on.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import * as locationService from "@/backend/services/location-service";
import * as scanService from "@/backend/services/scan-service";
import { isAppError } from "@/shared/errors";

export async function switchLocationAction(locationId: string): Promise<void> {
  const ctx = await requireTenant();
  await locationService.switchTo(ctx, z.string().min(1).max(200).parse(locationId));
  revalidatePath("/", "layout");
}

export type AddLocationState = { error: string | null };

export async function addLocationAction(_previous: AddLocationState, formData: FormData): Promise<AddLocationState> {
  const ctx = await requireTenant();
  try {
    await locationService.add(ctx, {
      street: formData.get("street") ?? "",
      city: formData.get("city") ?? "",
      region: formData.get("region") ?? "",
      postalCode: formData.get("postalCode") ?? "",
    });
  } catch (error) {
    if (isAppError(error)) return { error: error.userMessage };
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message ?? "Check the address." };
    throw error;
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Starts a scan of the active location, e.g. one just added. */
export async function scanActiveLocationAction(): Promise<{ error: string | null }> {
  const ctx = await requireTenant();
  try {
    await scanService.start(ctx);
  } catch (error) {
    if (isAppError(error)) return { error: error.userMessage };
    throw error;
  }
  revalidatePath("/dashboard");
  return { error: null };
}
