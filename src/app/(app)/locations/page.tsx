// Locations route: every location side by side, with a form to add another.
import type { Metadata } from "next";
import { requireTenant } from "@/backend/services/auth/require-tenant";
import { getOverview } from "@/backend/services/location-service";
import { LocationsOverview } from "@/frontend/components/locations/locations-overview";
import { locationsCopy } from "@/frontend/copy/locations";

export const metadata: Metadata = {
  title: "All Locations — REYNAV",
};

export default async function LocationsPage() {
  const ctx = await requireTenant();
  const overview = await getOverview(ctx);
  return <LocationsOverview overview={overview} copy={locationsCopy()} />;
}
