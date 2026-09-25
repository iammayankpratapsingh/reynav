// Content route: the catalogue of pieces this vertical publishes.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getCatalogue } from "@/backend/services/content-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { ContentEngine } from "@/frontend/components/content/content-engine";
import { contentCopy } from "@/frontend/copy/content";

export const metadata: Metadata = {
  title: "Content — REYNAV",
};

export default async function ContentPage() {
  const ctx = await requireTenant();
  const [workspace, catalogue] = await Promise.all([getWorkspace(ctx), getCatalogue(ctx)]);
  return <ContentEngine catalogue={catalogue} copy={contentCopy(workspace.labels)} />;
}
