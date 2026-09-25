// Booking platforms REYNAV can pull bookings from. About integrations, not about any one vertical.

export const BOOKING_PLATFORMS = [
  { id: "square", name: "Square" },
  { id: "fresha", name: "Fresha" },
  { id: "vagaro", name: "Vagaro" },
  { id: "mindbody", name: "Mindbody" },
  { id: "boulevard", name: "Boulevard" },
  { id: "jane", name: "Jane" },
  { id: "phorest", name: "Phorest" },
  { id: "booksy", name: "Booksy" },
] as const;

export type BookingPlatformId = (typeof BOOKING_PLATFORMS)[number]["id"];

/** Shown as their own cards in onboarding; the rest sit under "Other". */
export const FEATURED_BOOKING_PLATFORMS: readonly BookingPlatformId[] = ["square", "fresha"];

export const BOOKING_PLATFORM_IDS = BOOKING_PLATFORMS.map((platform) => platform.id) as [
  BookingPlatformId,
  ...BookingPlatformId[],
];

export function bookingPlatformName(id: BookingPlatformId): string {
  return BOOKING_PLATFORMS.find((platform) => platform.id === id)?.name ?? id;
}
