// Profile route: the signed-in person, the business and how complete the setup is.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getWorkspace } from "@/backend/services/organization-service";
import { getProfile } from "@/backend/services/profile-service";
import { ProfileScreen } from "@/frontend/components/profile/profile-screen";
import { profileCopy } from "@/frontend/copy/profile";

export const metadata: Metadata = {
  title: "Profile — REYNAV",
};

export default async function ProfilePage() {
  const ctx = await requireTenant();
  const [workspace, profile] = await Promise.all([getWorkspace(ctx), getProfile(ctx)]);
  return <ProfileScreen initial={profile} copy={profileCopy(workspace.labels)} />;
}
