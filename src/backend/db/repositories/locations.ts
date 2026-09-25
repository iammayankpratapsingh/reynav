import "server-only";
// Locations repository. A business with one location still has one row. "Active" is the location the caller
// is working on (from their session), falling back to the organisation's first location.
import { db, type LocationRow } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";
import type { AddressSource, Location, PostalAddress } from "@/shared/types/business";
import type { TenantContext } from "@/shared/types/tenant";

function toLocation(row: LocationRow): Location {
  // `?? null` covers rows cached in development from before the address columns existed.
  const hasAddress = (row.city ?? null) !== null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    businessId: row.business_id,
    label: row.label,
    address: hasAddress
      ? { street: row.street ?? "", city: row.city ?? "", region: row.region ?? "", postalCode: row.postal_code ?? "" }
      : null,
    addressSource: (row.address_source ?? null) as AddressSource | null,
  };
}

function ownRows(ctx: TenantContext): LocationRow[] {
  seedDemoTenant();
  return db.locations
    .filter((location) => location.organization_id === ctx.organizationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

/** The active location: the one in the caller's context when it belongs to them, else the first. */
export async function findPrimary(ctx: TenantContext): Promise<Location | null> {
  const rows = ownRows(ctx);
  const row = rows.find((location) => location.id === ctx.locationId) ?? rows[0];
  return row ? toLocation(row) : null;
}

export async function activeLocationId(ctx: TenantContext): Promise<string | null> {
  return (await findPrimary(ctx))?.id ?? null;
}

export async function findById(ctx: TenantContext, locationId: string): Promise<Location | null> {
  const row = ownRows(ctx).find((location) => location.id === locationId);
  return row ? toLocation(row) : null;
}

export async function listAll(ctx: TenantContext): Promise<Location[]> {
  return ownRows(ctx).map(toLocation);
}

export async function create(
  ctx: TenantContext,
  input: { businessId: string; address: PostalAddress },
): Promise<Location> {
  seedDemoTenant();
  const row = db.locations.insert({
    id: `loc_${ctx.organizationId}_${Date.now().toString(36)}`,
    organization_id: ctx.organizationId,
    business_id: input.businessId,
    label: `${input.address.city}, ${input.address.region}`,
    street: input.address.street || null,
    city: input.address.city,
    region: input.address.region,
    postal_code: input.address.postalCode || null,
    address_source: "manual",
    created_at: new Date().toISOString(),
  });
  return toLocation(row);
}

/** The first location of a new business, before onboarding knows its address. */
export async function createFirst(ctx: TenantContext, input: { businessId: string; label: string }): Promise<Location> {
  seedDemoTenant();
  const row = db.locations.insert({
    id: `loc_${ctx.organizationId}`,
    organization_id: ctx.organizationId,
    business_id: input.businessId,
    label: input.label,
    street: null,
    city: null,
    region: null,
    postal_code: null,
    address_source: null,
    created_at: new Date().toISOString(),
  });
  return toLocation(row);
}

export async function saveAddress(
  ctx: TenantContext,
  locationId: string,
  address: PostalAddress,
  source: AddressSource,
): Promise<void> {
  seedDemoTenant();
  const row = db.locations.findById(locationId);
  if (!row || row.organization_id !== ctx.organizationId) return;
  db.locations.update(locationId, {
    street: address.street || null,
    city: address.city,
    region: address.region,
    postal_code: address.postalCode || null,
    address_source: source,
    label: `${address.city}, ${address.region}`,
  });
}
