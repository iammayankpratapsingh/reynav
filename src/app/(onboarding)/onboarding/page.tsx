// Onboarding route: the four-step setup wizard that ends by starting the first scan.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getOnboardingState } from "@/backend/services/onboarding-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { OnboardingWizard } from "@/frontend/components/onboarding/onboarding-wizard";
import { onboardingCopy } from "@/frontend/copy/onboarding";

export const metadata: Metadata = {
  title: "Set up — REYNAV",
};

export default async function OnboardingPage() {
  const ctx = await requireTenant();
  const [workspace, state] = await Promise.all([getWorkspace(ctx), getOnboardingState(ctx)]);

  return <OnboardingWizard initialState={state} copy={onboardingCopy(workspace.labels)} />;
}
