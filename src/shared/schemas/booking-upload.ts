// The booking CSV template and the schema every uploaded row is parsed with. One definition, so the template
// shown in onboarding and the parser on the server can never disagree.
import { z } from "zod";

export const BOOKING_CHANNELS = ["online", "phone", "walk-in"] as const;
export const BOOKING_STATUSES = ["completed", "cancelled", "no-show"] as const;

export type BookingCsvColumn = {
  name: string;
  isRequired: boolean;
  format: string;
};

export const BOOKING_CSV_COLUMNS: readonly BookingCsvColumn[] = [
  { name: "booking_id", isRequired: true, format: "Your platform's booking reference" },
  { name: "booking_date", isRequired: true, format: "YYYY-MM-DD" },
  { name: "booking_time", isRequired: false, format: "HH:MM, 24-hour" },
  { name: "service", isRequired: true, format: "Service name as you sell it" },
  { name: "staff_member", isRequired: false, format: "First name or staff ID" },
  { name: "customer_ref", isRequired: false, format: "Anonymous ID — no names, emails or phones" },
  { name: "price", isRequired: true, format: "Amount paid, numbers only" },
  { name: "channel", isRequired: true, format: BOOKING_CHANNELS.join(" | ") },
  { name: "status", isRequired: true, format: BOOKING_STATUSES.join(" | ") },
];

/**
 * Example rows, one value per column in the order above. `null` marks the service column, which is filled
 * with the business's own service names so the example reads like their data, not someone else's.
 */
export const BOOKING_CSV_SAMPLE_ROWS: readonly (readonly (string | null)[])[] = [
  ["B-1001", "2026-09-12", "14:30", null, "Alex", "C-204", "120.00", "online", "completed"],
  ["B-1002", "2026-09-12", "16:00", null, "Sam", "C-318", "65.00", "phone", "completed"],
  ["B-1003", "2026-09-13", "", null, "", "C-092", "45.00", "walk-in", "no-show"],
];

export const BOOKING_CSV_REQUIRED_COLUMNS = BOOKING_CSV_COLUMNS.filter((column) => column.isRequired).map(
  (column) => column.name,
);

/** Upload limits, checked on the server before any parsing happens. */
export const BOOKING_CSV_MAX_BYTES = 5 * 1024 * 1024;
export const BOOKING_CSV_MAX_ROWS = 50_000;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));

export const BookingCsvRowSchema = z.object({
  booking_id: z.string().trim().min(1, "booking_id is empty").max(100),
  booking_date: z.iso.date("booking_date must be YYYY-MM-DD"),
  booking_time: optionalText(5).refine(
    (value) => value === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
    "booking_time must be HH:MM",
  ),
  service: z.string().trim().min(1, "service is empty").max(120),
  staff_member: optionalText(80),
  customer_ref: optionalText(80),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "price must be a number like 120.00")
    .transform(Number),
  channel: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(BOOKING_CHANNELS, `channel must be one of: ${BOOKING_CHANNELS.join(", ")}`)),
  status: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(BOOKING_STATUSES, `status must be one of: ${BOOKING_STATUSES.join(", ")}`)),
});

export type BookingCsvRow = z.infer<typeof BookingCsvRowSchema>;
