// Identity domain types. Our users table is the source of truth; the auth provider is linked by authProviderId.
import type { Role } from "@/shared/constants/roles";

export type User = {
  id: string;
  organizationId: string;
  authProviderId: string;
  email: string;
  displayName: string;
  role: Role;
};
