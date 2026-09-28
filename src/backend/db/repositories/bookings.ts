import "server-only";
// Tenant-scoped repository for imported bookings.
import { getSql, isUuid } from "@/backend/db/client";
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

type ImportRow = {
  file_name: string;
  row_count: number;
  first_booking_date: string;
  last_booking_date: string;
  created_at: string;
};

/** Rows per insert statement, well under Postgres's limit on bind parameters. */
const INSERT_CHUNK = 2000;

/** A new upload replaces the previous one for the location, so re-uploading a corrected file is safe. */
export async function replaceImport(ctx: TenantContext, input: NewBookingImport): Promise<BookingImportSummary> {
  const dates = input.rows.map((row) => row.booking_date).sort();

  const record = await getSql().begin(async (tx) => {
    // Deleting the imports cascades to their bookings.
    await tx`
      delete from booking_imports
      where organization_id = ${ctx.organizationId} and location_id = ${input.locationId}
    `;
    const [created] = await tx<(ImportRow & { id: string })[]>`
      insert into booking_imports
        (organization_id, location_id, file_name, storage_key, row_count, first_booking_date, last_booking_date)
      values (
        ${ctx.organizationId}, ${input.locationId}, ${input.fileName}, ${input.storageKey}, ${input.rows.length},
        ${dates[0] ?? null}, ${dates.at(-1) ?? null}
      )
      returning id, file_name, row_count, first_booking_date, last_booking_date, created_at
    `;
    const importId = created!.id;

    for (let start = 0; start < input.rows.length; start += INSERT_CHUNK) {
      const chunk = input.rows.slice(start, start + INSERT_CHUNK).map((row) => ({
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
      }));
      await tx`insert into bookings ${tx(chunk)}`;
    }
    return created!;
  });
  return toSummary(record);
}

export async function findLatestImport(ctx: TenantContext, locationId: string): Promise<BookingImportSummary | null> {
  if (!isUuid(locationId)) return null;
  const [latest] = await getSql()<ImportRow[]>`
    select file_name, row_count, first_booking_date, last_booking_date, created_at
    from booking_imports
    where organization_id = ${ctx.organizationId} and location_id = ${locationId}
    order by created_at desc
    limit 1
  `;
  return latest ? toSummary(latest) : null;
}

/** Every imported booking for the location, oldest first. */
export async function listForLocation(ctx: TenantContext, locationId: string): Promise<BookingRecord[]> {
  if (!isUuid(locationId)) return [];
  const rows = await getSql()<{ booked_on: string; service_name: string; price: number; channel: string; status: string }[]>`
    select booked_on, service_name, price, channel, status
    from bookings
    where organization_id = ${ctx.organizationId} and location_id = ${locationId}
    order by booked_on
  `;
  return rows.map((row) => ({
    bookedOn: row.booked_on,
    serviceName: row.service_name,
    price: row.price,
    channel: row.channel as BookingRecord["channel"],
    status: row.status as BookingRecord["status"],
  }));
}

export async function removeImports(ctx: TenantContext, locationId: string): Promise<void> {
  if (!isUuid(locationId)) return;
  // Deleting the imports cascades to their bookings.
  await getSql()`
    delete from booking_imports where organization_id = ${ctx.organizationId} and location_id = ${locationId}
  `;
}

function toSummary(row: ImportRow): BookingImportSummary {
  return {
    fileName: row.file_name,
    rowCount: row.row_count,
    firstBookingDate: row.first_booking_date,
    lastBookingDate: row.last_booking_date,
    importedAt: row.created_at,
  };
}
