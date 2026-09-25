// Membership roles. "system" is reserved for background jobs, which have no user.
export const ROLES = ["owner", "manager", "viewer", "system"] as const;

export type Role = (typeof ROLES)[number];

export function canManageConnections(role: Role): boolean {
  return role === "owner" || role === "manager" || role === "system";
}
