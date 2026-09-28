import "server-only";
// Locations repository. A business with one location still has one row. "Active" is the location the caller
// is working on (from their session), falling back to the organisation's first location.
import { getSql, isUuid } from "@/backend/db/client";
import type { AddressSource, Location, PostalAddress } from "@/shared/types/business";
import type { TenantContext } from "@/shared/types/tenant";

type LocationRow = {
  id: string;
  organization_id: string;
  business_id: string;
  label: string;
  street: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  address_source: string | null;
  search_radius_km: number;
};

function toLocation(row: LocationRow): Location {
  return {
    id: row.id,
    organizationId: row.organization_id,
    businessId: row.business_id,
    label: row.label,
    address:
      row.city === null
        ? null
        : { street: row.street ?? "", city: row.city, region: row.region ?? "", postalCode: row.postal_code ?? "" },
    addressSource: row.address_source as AddressSource | null,
    searchRadiusKm: row.search_radius_km,
  };
}

async function ownRows(ctx: TenantContext): Promise<LocationRow[]> {
  return getSql()<LocationRow[]>`
    select id, organization_id, business_id, label, street, city, region, postal_code, address_source, search_radius_km
    from locations where organization_id = ${ctx.organizationId}
    order by created_at, id
  `;
}

/** The active location: the one in the caller's context when it belongs to them, else the first. */
export async function findPrimary(ctx: TenantContext): Promise<Location | null> {
  const rows = await ownRows(ctx);
  const row = rows.find((location) => location.id === ctx.locationId) ?? rows[0];
  return row ? toLocation(row) : null;
}

export async function activeLocationId(ctx: TenantContext): Promise<string | null> {
  return (await findPrimary(ctx))?.id ?? null;
}

export async function findById(ctx: TenantContext, locationId: string): Promise<Location | null> {
  if (!isUuid(locationId)) return null;
  const [row] = await getSql()<LocationRow[]>`
    select id, organization_id, business_id, label, street, city, region, postal_code, address_source, search_radius_km
    from locations where id = ${locationId} and organization_id = ${ctx.organizationId}
  `;
  return row ? toLocation(row) : null;
}

export async function listAll(ctx: TenantContext): Promise<Location[]> {
  return (await ownRows(ctx)).map(toLocation);
}

export async function create(
  ctx: TenantContext,
  input: { businessId: string; address: PostalAddress },
): Promise<Location> {
  const [row] = await getSql()<LocationRow[]>`
    insert into locations (organization_id, business_id, label, street, city, region, postal_code, address_source)
    values (
      ${ctx.organizationId}, ${input.businessId}, ${`${input.address.city}, ${input.address.region}`},
      ${input.address.street || null}, ${input.address.city}, ${input.address.region},
      ${input.address.postalCode || null}, 'manual'
    )
    returning id, organization_id, business_id, label, street, city, region, postal_code, address_source, search_radius_km
  `;
  return toLocation(row!);
}

/** The first location of a new business, before onboarding knows its address. */
export async function createFirst(ctx: TenantContext, input: { businessId: string; label: string }): Promise<Location> {
  const [row] = await getSql()<LocationRow[]>`
    insert into locations (organization_id, business_id, label)
    values (${ctx.organizationId}, ${input.businessId}, ${input.label})
    returning id, organization_id, business_id, label, street, city, region, postal_code, address_source, search_radius_km
  `;
  return toLocation(row!);
}

export async function saveAddress(
  ctx: TenantContext,
  locationId: string,
  address: PostalAddress,
  source: AddressSource,
): Promise<void> {
  if (!isUuid(locationId)) return;
  await getSql()`
    update locations set
      street = ${address.street || null},
      city = ${address.city},
      region = ${address.region},
      postal_code = ${address.postalCode || null},
      address_source = ${source},
      label = ${`${address.city}, ${address.region}`},
      updated_at = now()
    where id = ${locationId} and organization_id = ${ctx.organizationId}
  `;
}

export async function saveSearchRadius(ctx: TenantContext, locationId: string, radiusKm: number): Promise<void> {
  if (!isUuid(locationId)) return;
  await getSql()`
    update locations set search_radius_km = ${radiusKm}, updated_at = now()
    where id = ${locationId} and organization_id = ${ctx.organizationId}
  `;
}
