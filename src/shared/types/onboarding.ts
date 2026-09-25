// What the onboarding wizard needs: the business as detected and confirmed, its connections, its booking
// data, and whether a scan may start.
import type { BookingPlatformId } from "@/shared/constants/booking-platforms";
import type { AddressSource, BusinessProfile, PostalAddress } from "./business";
import type { Connection, ConnectionProvider } from "./connection";

/** Every connectable capability, in the order the wizard asks for them. */
export const ONBOARDING_PROVIDERS: readonly ConnectionProvider[] = [
  "website",
  "local-listing",
  "search-performance",
  "web-analytics",
  "booking-source",
];

/** The Google step: optional, because plenty of businesses have none of these. */
export const GOOGLE_PROVIDERS = ["local-listing", "search-performance", "web-analytics"] as const;

export type GoogleProvider = (typeof GOOGLE_PROVIDERS)[number];

export type BusinessTypeOption = { id: string; name: string };

export type BookingImportSummary = {
  fileName: string;
  rowCount: number;
  /** ISO dates of the earliest and latest booking in the file. */
  firstBookingDate: string;
  lastBookingDate: string;
  importedAt: string;
};

export type OnboardingState = {
  businessName: string;
  verticalId: string;
  websiteUrl: string | null;
  /** The vertical's business types, offered as the "business type" choice. */
  businessTypes: BusinessTypeOption[];
  /** Null until the website has been read at least once. */
  profile: BusinessProfile | null;
  locationLabel: string;
  address: PostalAddress | null;
  addressSource: AddressSource | null;
  connections: Connection[];
  /** Which platform the booking connection belongs to, when one is linked. */
  bookingPlatformId: BookingPlatformId | null;
  bookingImport: BookingImportSummary | null;
  /** Example service names for the CSV template, taken from the business's own list where possible. */
  serviceExamples: string[];
  /** A scan needs the website read and a business type picked; every other source is optional. */
  canStartAnalysis: boolean;
  isOnboarded: boolean;
  /** True while connections are simulated, so the screen can say so rather than imply a real link. */
  isSimulated: boolean;
};
