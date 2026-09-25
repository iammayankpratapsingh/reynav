// Owner-entered service economics. Parsed at the Server Action boundary.
import { z } from "zod";

export const ServiceEconomicsSchema = z.object({
  serviceSlug: z.string().trim().min(1).max(120),
  averagePrice: z.coerce.number().min(0, "Price can't be negative.").max(100_000),
  durationMinutes: z.coerce.number().int().min(5, "At least 5 minutes.").max(1_440),
  marginPercent: z.coerce.number().min(0).max(100, "Margin is a percentage up to 100."),
});

export type ServiceEconomicsInput = z.infer<typeof ServiceEconomicsSchema>;
