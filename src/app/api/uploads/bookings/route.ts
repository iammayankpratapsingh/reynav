// Booking CSV upload: authenticate, check a file is present, hand it to bookingImportService, return the new state.
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { importCsv } from "@/backend/services/booking-import-service";
import { toErrorResponse } from "@/backend/lib/error-response";
import { ValidationError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const ctx = await requireTenant();
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) throw new ValidationError("No file in upload", "Choose a CSV file to upload.");

    const state = await importCsv(ctx, {
      fileName: file.name,
      contentType: file.type,
      body: new Uint8Array(await file.arrayBuffer()),
    });
    return Response.json(state);
  } catch (error) {
    return toErrorResponse(error);
  }
}
