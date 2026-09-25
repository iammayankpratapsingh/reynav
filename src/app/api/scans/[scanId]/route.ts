// Scan read route: authenticate, validate, call one service method, return the result.
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getScanView } from "@/backend/services/dashboard-service";
import { toErrorResponse } from "@/backend/lib/error-response";

export async function GET(_request: Request, { params }: { params: Promise<{ scanId: string }> }) {
  try {
    const ctx = await requireTenant();
    const { scanId } = await params;
    return Response.json(await getScanView(ctx, scanId));
  } catch (error) {
    return toErrorResponse(error);
  }
}
