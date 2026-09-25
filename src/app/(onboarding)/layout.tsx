// Onboarding shell: signed-in only, full screen, no sidebar — the wizard is the whole page until the first scan.
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTenant } from "@/backend/services/auth/require-tenant";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  if (!(await getTenant())) redirect("/login");
  return children;
}
