"use server";
// Sign-in Server Action: validate input, call one service method, return where to go. The form plays a short
// welcome animation before navigating, so the redirect happens on the client.
import { z } from "zod";
import { signIn } from "@/backend/services/auth/auth-service";
import { loginCopy } from "@/frontend/copy/login";
import { isAppError } from "@/shared/errors";

const CredentialSchema = z.object({
  email: z.email().max(320),
  password: z.string().min(1).max(200),
});

export type LoginFormState = { error: string | null; redirectTo: string | null };

export async function signInAction(_previous: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const copy = loginCopy();
  const parsed = CredentialSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: copy.errors.missing, redirectTo: null };

  try {
    await signIn(parsed.data);
  } catch (error) {
    if (isAppError(error)) return { error: error.userMessage, redirectTo: null };
    throw error;
  }

  // Home sends anyone who has not finished onboarding on to the wizard.
  return { error: null, redirectTo: "/dashboard" };
}
