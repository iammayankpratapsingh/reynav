// Typed client used by client components to call our API routes; the only fetch path from the browser.
import type { DashboardData } from "@/shared/types/dashboard";
import type { OnboardingState } from "@/shared/types/onboarding";

class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, headers: { accept: "application/json" } });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(response.status, body?.error ?? "Request failed.");
  }
  return (await response.json()) as T;
}

export function fetchScanView(scanId: string, signal?: AbortSignal): Promise<DashboardData> {
  return getJson<DashboardData>(`/api/scans/${encodeURIComponent(scanId)}`, signal);
}

/** Sends a booking CSV as multipart form data; the server checks size, type and every row. */
export async function uploadBookingsCsv(file: File): Promise<OnboardingState> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/uploads/bookings", { method: "POST", body, headers: { accept: "application/json" } });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(response.status, error?.error ?? "Upload failed.");
  }
  return (await response.json()) as OnboardingState;
}

export { ApiError };
