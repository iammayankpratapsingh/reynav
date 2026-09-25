// What the settings screen shows.
import type { Connection } from "./connection";
import type { Role } from "@/shared/constants/roles";

export type TeamMember = {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  isYou: boolean;
};

export type Invitation = {
  id: string;
  email: string;
  role: Role;
  status: "pending" | "revoked";
  createdAt: string;
};

export type ReportPreferences = {
  weeklyEnabled: boolean;
  recipients: string[];
  lastSentAt: string | null;
  /** Monday at 08:00 after the last send, or the coming Monday. */
  nextSendAt: string | null;
};

export type SettingsView = {
  businessName: string;
  locationLabel: string;
  verticalName: string;
  websiteUrl: string | null;
  connections: Connection[];
  team: TeamMember[];
  seatsUsed: number;
  seatsIncluded: number;
  planName: string;
  invitations: Invitation[];
  canManageTeam: boolean;
  reports: ReportPreferences;
  /** True while email is simulated, so the screen does not claim anything was delivered. */
  isEmailSimulated: boolean;
};
