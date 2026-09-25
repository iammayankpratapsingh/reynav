// Bookings route: the path from search visibility to booked work.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getPerformance } from "@/backend/services/booking-service";
import { getWorkspace } from "@/backend/services/organization-service";
import { BookingPerformance } from "@/frontend/components/bookings/booking-performance";
import { bookingsCopy } from "@/frontend/copy/bookings";

export const metadata: Metadata = {
  title: "Bookings — REYNAV",
};

export default async function BookingsPage() {
  const ctx = await requireTenant();
  const [workspace, data] = await Promise.all([getWorkspace(ctx), getPerformance(ctx)]);
  return <BookingPerformance data={data} copy={bookingsCopy(workspace.labels)} />;
}
