"use server";
// Sign-up Server Action: call one service method, return where to go. The form plays the welcome loader
// before navigating, so the redirect happens on the client.
import { z } from "zod";
import { signUp } from "@/backend/services/auth/auth-service";
import { isAppError } from "@/shared/errors";

export type SignupFormState = { error: string | null; redirectTo: string | null };

export async function signUpAction(_previous: SignupFormState, formData: FormData): Promise<SignupFormState> {
  try {
    await signUp({
      name: formData.get("name"),
      businessName: formData.get("businessName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
  } catch (error) {
    if (isAppError(error)) return { error: error.userMessage, redirectTo: null };
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message ?? "Check your details.", redirectTo: null };
    throw error;
  }
  return { error: null, redirectTo: "/onboarding" };
}
