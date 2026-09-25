// TenantContext type: organizationId, userId, role.
import type { Role } from "@/shared/constants/roles";

export type TenantContext = {
  organizationId: string;
  userId: string | null; // null for background jobs
  role: Role;
  /** The location being worked on. Unset means the organisation's first location. */
  locationId?: string | null;
};
