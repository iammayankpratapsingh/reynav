import "server-only";
// Competitor snapshots: the business and its rivals as one scan saw them. Stored per scan so the page reads
// a lookup and a later scan can be compared with an earlier one.
import type postgres from "postgres";
import { z } from "zod";
import { getSql, isUuid } from "@/backend/db/client";
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
  const sql = getSql();
  const rows = input.profiles.map((profile, index) => ({
    organization_id: ctx.organizationId,
    location_id: input.locationId,
    scan_id: input.scanId,
    name: profile.name,
    is_self: profile.isYou,
    profile: sql.json(profile as unknown as postgres.JSONValue),
    sort_order: index,
  }));
  await sql.begin(async (tx) => {
    await tx`delete from competitor_snapshots where scan_id = ${input.scanId} and organization_id = ${ctx.organizationId}`;
    if (rows.length > 0) await tx`insert into competitor_snapshots ${tx(rows)}`;
  });
}

export async function listForScan(ctx: TenantContext, scanId: string): Promise<CompetitorProfile[]> {
  if (!isUuid(scanId)) return [];
  const rows = await getSql()<{ profile: unknown }[]>`
    select profile from competitor_snapshots
    where scan_id = ${scanId} and organization_id = ${ctx.organizationId}
    order by sort_order
  `;
  return rows.flatMap((row) => {
    const parsed = ProfileSchema.safeParse(row.profile);
    return parsed.success ? [parsed.data] : [];
  });
}
