import "server-only";
// Validates and imports booking data from a CSV that follows the onboarding template.
// The file is size- and type-checked, stored through FileStorage, then parsed row by row with the shared schema.
import { getFileStorage } from "@/backend/adapters/file-storage";
import * as bookingsRepository from "@/backend/db/repositories/bookings";
import { logger } from "@/backend/lib/logger";
import { ValidationError } from "@/shared/errors";
import {
  BOOKING_CSV_COLUMNS,
  BOOKING_CSV_MAX_BYTES,
  BOOKING_CSV_MAX_ROWS,
  BOOKING_CSV_REQUIRED_COLUMNS,
  BookingCsvRowSchema,
  type BookingCsvRow,
} from "@/shared/schemas/booking-upload";
import type { OnboardingState } from "@/shared/types/onboarding";
import type { TenantContext } from "@/shared/types/tenant";
import { requireManager } from "./connection-service";
import { getOnboardingState, requirePrimaryLocation } from "./onboarding-service";

/** How many row problems to list before asking the owner to fix the file and try again. */
const MAX_REPORTED_ERRORS = 5;

const ACCEPTED_TYPES = new Set(["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain", ""]);

export type BookingUpload = {
  fileName: string;
  contentType: string;
  body: Uint8Array;
};

export async function importCsv(ctx: TenantContext, upload: BookingUpload): Promise<OnboardingState> {
  requireManager(ctx);
  checkFile(upload);

  const text = new TextDecoder("utf-8").decode(upload.body).replace(/^﻿/, "");
  const rows = parseRows(text);
  const location = await requirePrimaryLocation(ctx);

  const stored = await getFileStorage().put({
    key: `${ctx.organizationId}/${location.id}/bookings/${Date.now()}.csv`,
    body: upload.body,
    contentType: "text/csv",
  });

  const summary = await bookingsRepository.replaceImport(ctx, {
    locationId: location.id,
    fileName: upload.fileName.slice(0, 200),
    storageKey: stored.key,
    rows,
  });

  logger.info({ message: "bookings imported", organizationId: ctx.organizationId, rows: summary.rowCount });
  return getOnboardingState(ctx);
}

export async function removeImport(ctx: TenantContext): Promise<OnboardingState> {
  requireManager(ctx);
  const location = await requirePrimaryLocation(ctx);
  await bookingsRepository.removeImports(ctx, location.id);
  return getOnboardingState(ctx);
}

function checkFile({ fileName, contentType, body }: BookingUpload): void {
  if (!fileName.toLowerCase().endsWith(".csv") || !ACCEPTED_TYPES.has(contentType)) {
    throw new ValidationError(`Rejected upload type ${contentType}`, "Upload a .csv file.");
  }
  if (body.byteLength === 0) throw new ValidationError("Empty upload", "That file is empty.");
  if (body.byteLength > BOOKING_CSV_MAX_BYTES) {
    throw new ValidationError(
      `Upload of ${body.byteLength} bytes over limit`,
      `That file is too large. The limit is ${BOOKING_CSV_MAX_BYTES / (1024 * 1024)} MB.`,
    );
  }
}

function parseRows(text: string): BookingCsvRow[] {
  const [header, ...records] = parseCsv(text).filter((record) => record.some((cell) => cell.trim() !== ""));
  if (!header) throw new ValidationError("CSV has no header", "That file has no rows.");

  const columns = header.map((name) => name.trim().toLowerCase().replace(/\s+/g, "_"));
  const missing = BOOKING_CSV_REQUIRED_COLUMNS.filter((name) => !columns.includes(name));
  if (missing.length > 0) {
    throw new ValidationError(
      `CSV missing columns ${missing.join(",")}`,
      `The file is missing these template columns: ${missing.join(", ")}.`,
    );
  }
  if (records.length === 0) throw new ValidationError("CSV has no data rows", "The file has a header but no bookings.");
  if (records.length > BOOKING_CSV_MAX_ROWS) {
    throw new ValidationError(
      `CSV has ${records.length} rows`,
      `The file has more than ${BOOKING_CSV_MAX_ROWS.toLocaleString("en-CA")} bookings. Split it and upload the most recent part.`,
    );
  }

  const rows: BookingCsvRow[] = [];
  const problems: string[] = [];
  records.forEach((record, index) => {
    const raw = Object.fromEntries(
      BOOKING_CSV_COLUMNS.map(({ name }) => {
        const position = columns.indexOf(name);
        return [name, position >= 0 ? (record[position] ?? "") : ""];
      }),
    );
    const parsed = BookingCsvRowSchema.safeParse(raw);
    if (parsed.success) rows.push(parsed.data);
    // +2: one for the header, one because people count rows from 1.
    else if (problems.length < MAX_REPORTED_ERRORS) problems.push(`row ${index + 2}: ${parsed.error.issues[0]?.message}`);
  });

  if (problems.length > 0) {
    throw new ValidationError(
      "CSV rows failed validation",
      `Some rows do not match the template — ${problems.join("; ")}. Fix them and upload again.`,
    );
  }
  return rows;
}

/** RFC 4180: comma-separated, double-quoted fields may hold commas, newlines and "" as an escaped quote. */
function parseCsv(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') inQuotes = false;
      else field += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else field += char;
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}
