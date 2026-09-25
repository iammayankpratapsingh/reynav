import "server-only";
// Tenant-scoped repository for imported bookings.
import { db } from "@/backend/db/client";
import { seedDemoTenant } from "@/backend/db/seed";
import type { BookingRecord } from "@/shared/types/booking";
import type { BookingCsvRow } from "@/shared/schemas/booking-upload";
import type { BookingImportSummary } from "@/shared/types/onboarding";
import type { TenantContext } from "@/shared/types/tenant";

export type NewBookingImport = {
  locationId: string;
  fileName: string;
  storageKey: string;
  rows: readonly BookingCsvRow[];
};

/** A new upload replaces the previous one for the location, so re-uploading a corrected file is safe. */
export async function replaceImport(ctx: TenantContext, input: NewBookingImport): Promise<BookingImportSummary> {
  seedDemoTenant();
  const belongsHere = (row: { organization_id: string; location_id: string }) =>
    row.organization_id === ctx.organizationId && row.location_id === input.locationId;
  db.bookings.remove(belongsHere);
  db.bookingImports.remove(belongsHere);

  const now = new Date().toISOString();
  const importId = `imp_${ctx.organizationId}_${input.locationId}_${Date.now()}`;
  const dates = input.rows.map((row) => row.booking_date).sort();

  input.rows.forEach((row, index) => {
    db.bookings.insert({
      id: `${importId}_${index}`,
      organization_id: ctx.organizationId,
      location_id: input.locationId,
      import_id: importId,
      external_ref: row.booking_id,
      booked_on: row.booking_date,
      booked_at_time: row.booking_time,
      service_name: row.service,
      staff_member: row.staff_member,
      customer_ref: row.customer_ref,
      price: row.price,
      channel: row.channel,
      status: row.status,
      created_at: now,
    });
  });

  const record = db.bookingImports.insert({
    id: importId,
    organization_id: ctx.organizationId,
    location_id: input.locationId,
    file_name: input.fileName,
    storage_key: input.storageKey,
    row_count: input.rows.length,
    first_booking_date: dates[0] ?? "",
    last_booking_date: dates.at(-1) ?? "",
    created_at: now,
  });
  return toSummary(record);
}

export async function findLatestImport(ctx: TenantContext, locationId: string): Promise<BookingImportSummary | null> {
  seedDemoTenant();
  const [latest] = db.bookingImports
    .filter((row) => row.organization_id === ctx.organizationId && row.location_id === locationId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return latest ? toSummary(latest) : null;
}

/** Every imported booking for the location, oldest first. */
export async function listForLocation(ctx: TenantContext, locationId: string): Promise<BookingRecord[]> {
  seedDemoTenant();
  return db.bookings
    .filter((row) => row.organization_id === ctx.organizationId && row.location_id === locationId)
    .sort((a, b) => a.booked_on.localeCompare(b.booked_on))
    .map((row) => ({
      bookedOn: row.booked_on,
      serviceName: row.service_name,
      price: row.price,
      channel: row.channel as BookingRecord["channel"],
      status: row.status as BookingRecord["status"],
    }));
}

export async function removeImports(ctx: TenantContext, locationId: string): Promise<void> {
  seedDemoTenant();
  const belongsHere = (row: { organization_id: string; location_id: string }) =>
    row.organization_id === ctx.organizationId && row.location_id === locationId;
  db.bookings.remove(belongsHere);
  db.bookingImports.remove(belongsHere);
}

function toSummary(row: {
  file_name: string;
  row_count: number;
  first_booking_date: string;
  last_booking_date: string;
  created_at: string;
}): BookingImportSummary {
  return {
    fileName: row.file_name,
    rowCount: row.row_count,
    firstBookingDate: row.first_booking_date,
    lastBookingDate: row.last_booking_date,
    importedAt: row.created_at,
  };
}
