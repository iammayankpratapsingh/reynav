// Account schemas: sign-up and team invitations. Parsed at the Server Action boundary.
import { z } from "zod";
import { ROLES } from "@/shared/constants/roles";

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  businessName: z.string().trim().min(1, "Enter your business name.").max(160),
  email: z.email("Enter a valid email address.").max(320),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

/** Who can be invited: everyone except the owner (there is one) and system (never a person). */
export const INVITABLE_ROLES = ROLES.filter((role) => role === "manager" || role === "viewer") as [
  "manager",
  "viewer",
];

export const InviteSchema = z.object({
  email: z.email("Enter a valid email address.").max(320),
  role: z.enum(INVITABLE_ROLES),
});
