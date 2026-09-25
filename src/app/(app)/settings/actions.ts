"use server";
// Settings Server Actions: team invitations and the weekly report email.
// Each one authenticates, validates, calls one service method and returns the outcome.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import * as reportEmailService from "@/backend/services/report-email-service";
import * as teamService from "@/backend/services/team-service";
import { isAppError } from "@/shared/errors";
import type { ReportPreferences } from "@/shared/types/settings";

function toUserMessage(error: unknown): string {
  if (isAppError(error)) return error.userMessage;
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Please check what you entered.";
  throw error;
}

export type InviteState = { error: string | null; sentTo: string | null };

export async function inviteAction(_previous: InviteState, formData: FormData): Promise<InviteState> {
  const ctx = await requireTenant();
  const email = String(formData.get("email") ?? "");
  try {
    await teamService.invite(ctx, { email, role: formData.get("role") });
  } catch (error) {
    return { error: toUserMessage(error), sentTo: null };
  }
  revalidatePath("/settings");
  return { error: null, sentTo: email.trim().toLowerCase() };
}

export async function revokeInviteAction(invitationId: string): Promise<{ error: string | null }> {
  const ctx = await requireTenant();
  try {
    await teamService.revoke(ctx, z.string().min(1).max(200).parse(invitationId));
  } catch (error) {
    return { error: toUserMessage(error) };
  }
  revalidatePath("/settings");
  return { error: null };
}

export type ReportResult = { preferences: ReportPreferences; error: null } | { preferences: null; error: string };

export async function saveReportPreferencesAction(input: unknown): Promise<ReportResult> {
  const ctx = await requireTenant();
  try {
    return { preferences: await reportEmailService.savePreferences(ctx, input), error: null };
  } catch (error) {
    return { preferences: null, error: toUserMessage(error) };
  }
}

export async function sendReportNowAction(): Promise<ReportResult> {
  const ctx = await requireTenant();
  try {
    return { preferences: await reportEmailService.sendNow(ctx), error: null };
  } catch (error) {
    return { preferences: null, error: toUserMessage(error) };
  }
}
