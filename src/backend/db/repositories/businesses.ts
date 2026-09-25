import "server-only";
// Businesses repository. Every read is filtered by organisation here, never by RLS alone.
import { db, type BusinessRow } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";
import type { Business, BusinessProfile } from "@/shared/types/business";
import type { TenantContext } from "@/shared/types/tenant";

function parseNames(json: string | null | undefined): string[] {
  if (!json) return [];
  const parsed: unknown = JSON.parse(json);
  return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
}

function toBusiness(row: BusinessRow): Business {
  // `?? null` covers rows cached in development from before these columns existed.
  const hasProfile = (row.services_json ?? null) !== null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    verticalId: row.vertical_id,
    websiteUrl: row.website_url,
    profile: hasProfile
      ? {
          businessTypeId: row.business_type_id ?? null,
          services: parseNames(row.services_json),
          segments: parseNames(row.segments_json),
        }
      : null,
    onboardedAt: row.onboarded_at ?? null,
  };
}

function ownedRow(ctx: TenantContext, businessId: string): BusinessRow | null {
  const row = db.businesses.findById(businessId);
  return row && row.organization_id === ctx.organizationId ? row : null;
}

export async function findPrimary(ctx: TenantContext): Promise<Business | null> {
  seedDemoTenant();
  const row = db.businesses.find((business) => business.organization_id === ctx.organizationId);
  return row ? toBusiness(row) : null;
}

export async function setWebsiteUrl(ctx: TenantContext, businessId: string, websiteUrl: string | null): Promise<void> {
  seedDemoTenant();
  if (!ownedRow(ctx, businessId)) return;
  db.businesses.update(businessId, { website_url: websiteUrl });
}

export async function saveProfile(ctx: TenantContext, businessId: string, profile: BusinessProfile): Promise<void> {
  seedDemoTenant();
  if (!ownedRow(ctx, businessId)) return;
  db.businesses.update(businessId, {
    business_type_id: profile.businessTypeId,
    services_json: JSON.stringify(profile.services),
    segments_json: JSON.stringify(profile.segments),
  });
}

export async function markOnboarded(ctx: TenantContext, businessId: string, at: string): Promise<void> {
  seedDemoTenant();
  const row = ownedRow(ctx, businessId);
  if (!row || row.onboarded_at) return;
  db.businesses.update(businessId, { onboarded_at: at });
}

export async function create(ctx: TenantContext, input: { name: string; verticalId: string }): Promise<Business> {
  seedDemoTenant();
  const row = db.businesses.insert({
    id: `biz_${Date.now().toString(36)}`,
    organization_id: ctx.organizationId,
    name: input.name,
    vertical_id: input.verticalId,
    website_url: null,
    business_type_id: null,
    services_json: null,
    segments_json: null,
    onboarded_at: null,
    created_at: new Date().toISOString(),
  });
  return toBusiness(row);
}

export async function rename(ctx: TenantContext, businessId: string, name: string): Promise<void> {
  seedDemoTenant();
  if (!ownedRow(ctx, businessId)) return;
  db.businesses.update(businessId, { name });
}
