import "server-only";
// Competitor snapshots: the business and its rivals as one scan saw them. Stored per scan so the page reads
// a lookup and a later scan can be compared with an earlier one.
import { z } from "zod";
import { db } from "@/backend/db/client";
import type { CompetitorProfile } from "@/shared/types/competitor";
import type { TenantContext } from "@/shared/types/tenant";

const ProfileSchema = z.object({
  name: z.string(),
  isYou: z.boolean(),
  websiteUrl: z.string().nullable(),
  averageRating: z.number(),
  reviewCount: z.number(),
  reviewsLast30Days: z.number(),
  reviewsPrevious30Days: z.number(),
  averageMapPosition: z.number().nullable(),
  services: z.array(z.string()),
  pageTopics: z.array(z.string()),
  pageCount: z.number(),
  postsLast90Days: z.number(),
  photoCount: z.number(),
  mapPositions: z.array(
    z.object({ serviceSlug: z.string(), serviceName: z.string(), mapPosition: z.number().nullable() }),
  ),
});

/** Replaces the snapshot for a scan, so a retried step cannot duplicate rows. */
export async function replaceForScan(
  ctx: TenantContext,
  input: { scanId: string; locationId: string; profiles: readonly CompetitorProfile[] },
): Promise<void> {
  db.competitorSnapshots.remove((row) => row.organization_id === ctx.organizationId && row.scan_id === input.scanId);
  const createdAt = new Date().toISOString();
  input.profiles.forEach((profile, index) => {
    db.competitorSnapshots.insert({
      id: `comp_${input.scanId}_${index}`,
      organization_id: ctx.organizationId,
      location_id: input.locationId,
      scan_id: input.scanId,
      name: profile.name,
      is_self: profile.isYou,
      profile_json: JSON.stringify(profile),
      created_at: createdAt,
    });
  });
}

export async function listForScan(ctx: TenantContext, scanId: string): Promise<CompetitorProfile[]> {
  return db.competitorSnapshots
    .filter((row) => row.organization_id === ctx.organizationId && row.scan_id === scanId)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    .flatMap((row) => {
      const parsed = ProfileSchema.safeParse(JSON.parse(row.profile_json));
      return parsed.success ? [parsed.data] : [];
    });
}
