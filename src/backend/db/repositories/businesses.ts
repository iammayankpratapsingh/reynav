import "server-only";
// Businesses repository. Every read is filtered by organisation here, never by RLS alone.
import { getSql, isUuid } from "@/backend/db/client";
import type { Business, BusinessProfile } from "@/shared/types/business";
import type { TenantContext } from "@/shared/types/tenant";

type BusinessRow = {
  id: string;
  organization_id: string;
  name: string;
  vertical_id: string;
  website_url: string | null;
  business_type_id: string | null;
  /** Display names as the owner confirmed them. Null until the website has been read. */
  services: unknown;
  segments: unknown;
  onboarded_at: string | null;
};

function names(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    verticalId: row.vertical_id,
    websiteUrl: row.website_url,
    profile:
      row.services === null
        ? null
        : { businessTypeId: row.business_type_id, services: names(row.services), segments: names(row.segments) },
    onboardedAt: row.onboarded_at,
  };
}

export async function findPrimary(ctx: TenantContext): Promise<Business | null> {
  const [row] = await getSql()<BusinessRow[]>`
    select id, organization_id, name, vertical_id, website_url, business_type_id, services, segments, onboarded_at
    from businesses where organization_id = ${ctx.organizationId}
    order by created_at, id
    limit 1
  `;
  return row ? toBusiness(row) : null;
}

export async function setWebsiteUrl(ctx: TenantContext, businessId: string, websiteUrl: string | null): Promise<void> {
  if (!isUuid(businessId)) return;
  await getSql()`
    update businesses set website_url = ${websiteUrl}, updated_at = now()
    where id = ${businessId} and organization_id = ${ctx.organizationId}
  `;
}

export async function saveProfile(ctx: TenantContext, businessId: string, profile: BusinessProfile): Promise<void> {
  if (!isUuid(businessId)) return;
  const sql = getSql();
  await sql`
    update businesses set
      business_type_id = ${profile.businessTypeId},
      services = ${sql.json([...profile.services])},
      segments = ${sql.json([...profile.segments])},
      updated_at = now()
    where id = ${businessId} and organization_id = ${ctx.organizationId}
  `;
}

export async function markOnboarded(ctx: TenantContext, businessId: string, at: string): Promise<void> {
  if (!isUuid(businessId)) return;
  await getSql()`
    update businesses set onboarded_at = ${at}, updated_at = now()
    where id = ${businessId} and organization_id = ${ctx.organizationId} and onboarded_at is null
  `;
}

export async function create(ctx: TenantContext, input: { name: string; verticalId: string }): Promise<Business> {
  const [row] = await getSql()<BusinessRow[]>`
    insert into businesses (organization_id, name, vertical_id)
    values (${ctx.organizationId}, ${input.name}, ${input.verticalId})
    returning id, organization_id, name, vertical_id, website_url, business_type_id, services, segments, onboarded_at
  `;
  return toBusiness(row!);
}

export async function rename(ctx: TenantContext, businessId: string, name: string): Promise<void> {
  if (!isUuid(businessId)) return;
  await getSql()`
    update businesses set name = ${name}, updated_at = now()
    where id = ${businessId} and organization_id = ${ctx.organizationId}
  `;
}
