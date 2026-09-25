// The profile screen: who you are, the business, its locations and connections, and how complete it all is.
import type { Role } from "@/shared/constants/roles";
import type { ConnectionStatus, ConnectionProvider } from "./connection";

export const PROFILE_CHECKS = ["website", "services", "address", "listing", "bookings", "team", "prices"] as const;

export type ProfileCheck = (typeof PROFILE_CHECKS)[number];

export type ProfileView = {
  user: { displayName: string; email: string; role: Role };
  business: {
    name: string;
    typeName: string | null;
    verticalName: string;
    websiteUrl: string | null;
    services: string[];
    segments: string[];
    memberSince: string;
  };
  activeLocationLabel: string;
  locations: { id: string; label: string; address: string | null; isActive: boolean }[];
  connections: { provider: ConnectionProvider; status: ConnectionStatus; accountLabel: string | null }[];
  stats: { growthScore: number | null; locationCount: number; serviceCount: number; teamCount: number };
  weeklyReportOn: boolean;
  /** Each step towards a fully set-up profile, and whether it is done. */
  checklist: { id: ProfileCheck; isDone: boolean; href: string }[];
  canEditBusiness: boolean;
};
