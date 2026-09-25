// Input schemas for business setup. Parsed at every boundary: Server Actions, routes and job payloads.
import { z } from "zod";

/** Accepts what someone actually types ("www.example.ca") and normalises it to a URL we can crawl. */
export const WebsiteUrlSchema = z
  .string()
  .trim()
  .min(3, "Enter your website address.")
  .max(253, "That address is too long.")
  .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
  .refine((value) => {
    try {
      const { hostname } = new URL(value);
      return hostname.includes(".") && !hostname.endsWith(".");
    } catch {
      return false;
    }
  }, "That does not look like a website address.");

export const SetWebsiteSchema = z.object({ websiteUrl: WebsiteUrlSchema });

export type SetWebsiteInput = z.infer<typeof SetWebsiteSchema>;

const ProfileTermSchema = z.string().trim().min(1).max(60);

export const SaveProfileSchema = z.object({
  businessTypeId: z.string().trim().min(1, "Pick your business type.").max(60),
  services: z.array(ProfileTermSchema).min(1, "Keep at least one service.").max(60),
  segments: z.array(ProfileTermSchema).max(30),
});

export type SaveProfileInput = z.infer<typeof SaveProfileSchema>;

export const PostalAddressSchema = z.object({
  street: z.string().trim().max(160),
  city: z.string().trim().min(1, "Enter your city.").max(80),
  region: z.string().trim().min(1, "Enter your province or state.").max(80),
  postalCode: z.string().trim().max(20),
});

export type PostalAddressInput = z.infer<typeof PostalAddressSchema>;
