"use server";
// Onboarding Server Actions: authenticate, validate, call one service method, return the new state.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import * as bookingImportService from "@/backend/services/booking-import-service";
import * as businessService from "@/backend/services/business-service";
import * as connectionService from "@/backend/services/connection-service";
import * as scanService from "@/backend/services/scan-service";
import { BOOKING_PLATFORM_IDS } from "@/shared/constants/booking-platforms";
import { isAppError } from "@/shared/errors";
import { GOOGLE_PROVIDERS, type OnboardingState } from "@/shared/types/onboarding";

export type OnboardingActionResult = { state: OnboardingState; error: null } | { state: null; error: string };

const GoogleProviderSchema = z.enum(GOOGLE_PROVIDERS);
const BookingPlatformSchema = z.enum(BOOKING_PLATFORM_IDS);

async function run(change: () => Promise<OnboardingState>): Promise<OnboardingActionResult> {
  try {
    const state = await change();
    revalidatePath("/onboarding");
    return { state, error: null };
  } catch (error) {
    return { state: null, error: toUserMessage(error) };
  }
}

export async function analyseWebsiteAction(websiteUrl: string): Promise<OnboardingActionResult> {
  const ctx = await requireTenant();
  return run(() => businessService.analyseWebsite(ctx, { websiteUrl }));
}

export async function saveProfileAction(profile: unknown): Promise<OnboardingActionResult> {
  const ctx = await requireTenant();
  return run(() => businessService.saveProfile(ctx, profile));
}

export async function connectGoogleAction(provider: string): Promise<OnboardingActionResult> {
  const ctx = await requireTenant();
  const parsed = GoogleProviderSchema.safeParse(provider);
  if (!parsed.success) return { state: null, error: "Unknown connection." };
  return run(() => connectionService.connect(ctx, parsed.data));
}

export async function connectBookingPlatformAction(platformId: string): Promise<OnboardingActionResult> {
  const ctx = await requireTenant();
  const parsed = BookingPlatformSchema.safeParse(platformId);
  if (!parsed.success) return { state: null, error: "Unknown booking platform." };
  return run(() => connectionService.connectBookingPlatform(ctx, parsed.data));
}

export async function disconnectAction(provider: string): Promise<OnboardingActionResult> {
  const ctx = await requireTenant();
  const parsed = z.enum([...GOOGLE_PROVIDERS, "booking-source"]).safeParse(provider);
  if (!parsed.success) return { state: null, error: "Unknown connection." };
  return run(() => connectionService.disconnect(ctx, parsed.data));
}

export async function saveAddressAction(address: unknown): Promise<OnboardingActionResult> {
  const ctx = await requireTenant();
  return run(() => connectionService.saveAddress(ctx, address));
}

export async function removeBookingImportAction(): Promise<OnboardingActionResult> {
  const ctx = await requireTenant();
  return run(() => bookingImportService.removeImport(ctx));
}

export async function startAnalysisAction(): Promise<{ scanId: string; error: null } | { scanId: null; error: string }> {
  const ctx = await requireTenant();
  try {
    const scan = await scanService.start(ctx);
    return { scanId: scan.id, error: null };
  } catch (error) {
    return { scanId: null, error: toUserMessage(error) };
  }
}

function toUserMessage(error: unknown): string {
  if (isAppError(error)) return error.userMessage;
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Please check what you entered.";
  throw error;
}
