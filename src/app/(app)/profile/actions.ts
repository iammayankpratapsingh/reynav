"use server";
// Profile edits: your name and the business name. Authenticate, call one service method, return the profile.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import * as profileService from "@/backend/services/profile-service";
import { isAppError } from "@/shared/errors";
import type { ProfileView } from "@/shared/types/profile";

export type ProfileResult = { profile: ProfileView; error: null } | { profile: null; error: string };

async function run(change: () => Promise<ProfileView>): Promise<ProfileResult> {
  try {
    const profile = await change();
    revalidatePath("/", "layout");
    return { profile, error: null };
  } catch (error) {
    if (isAppError(error)) return { profile: null, error: error.userMessage };
    if (error instanceof z.ZodError) return { profile: null, error: error.issues[0]?.message ?? "Check the name." };
    throw error;
  }
}

export async function updateDisplayNameAction(name: string): Promise<ProfileResult> {
  const ctx = await requireTenant();
  return run(() => profileService.updateDisplayName(ctx, name));
}

export async function renameBusinessAction(name: string): Promise<ProfileResult> {
  const ctx = await requireTenant();
  return run(() => profileService.renameBusiness(ctx, name));
}
