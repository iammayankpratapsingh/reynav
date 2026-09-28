// Onboarding shell: signed-in only, full screen, no sidebar — the wizard is the whole page until the first scan.
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTenant } from "@/backend/services/auth/require-tenant";

/** The first scan starts here and runs after the response, in the same function; it takes ~25s. */
export const maxDuration = 60;

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  if (!(await getTenant())) redirect("/login");
  return children;
}
