// Product copy for the settings screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function settingsCopy(labels: VerticalLabels) {
  const business = labels.business;

  return {
    title: "Settings",
    subtitle: "Your business, your connections and who can see them.",
    business: {
      heading: `${business} details`,
      nameLabel: "Business name",
      locationLabel: "Location",
      verticalLabel: "Industry pack",
      websiteLabel: "Website",
      noWebsite: "Not set",
      editNote: "Editing business details is not connected yet.",
    },
    connections: {
      heading: "Connections",
      note: "Manage these in setup while connections are simulated.",
      manage: "Manage connections",
      status: {
        disconnected: "Not connected",
        connecting: "Connecting",
        connected: "Connected",
        needs_reconnect: "Reconnect needed",
        failed: "Failed",
      },
      labels: {
        website: "Website",
        "local-listing": "Google Business Profile",
        "search-performance": "Google Search Console",
        "web-analytics": "Google Analytics",
        "booking-source": "Booking system",
      },
    },
    team: {
      heading: "Team",
      roleLabel: "Role",
      youLabel: "You",
      inviteNote: "Owners and managers can invite people.",
      inviteHeading: "Invite a teammate",
      emailLabel: "Email",
      roles: { owner: "Owner", manager: "Manager", viewer: "Viewer" },
      roleHelp: "Managers can change connections and settings. Viewers can see everything but change nothing.",
      send: "Send invite",
      sending: "Sending…",
      /** {email} is filled in on the client. */
      sent: "Invitation sent to {email}.",
      sentSimulated: "Invitation recorded for {email} — email is simulated, so nothing was actually sent.",
      pendingHeading: "Waiting to accept",
      pendingLabel: "Invitation sent",
      revoke: "Withdraw",
      onlyManagers: "Only owners and managers can invite people.",
      seatsPrefix: "Using",
      seatsSuffix: "seats",
    },
    reports: {
      heading: "Weekly report email",
      toggle: "Email a weekly report every Monday morning",
      recipientsLabel: "Send to",
      recipientsHelp: "Separate addresses with commas.",
      nextLabel: "Next report",
      lastLabel: "Last sent",
      off: "Off",
      never: "Never",
      sendNow: "Send one now",
      sending: "Sending…",
      saved: "Saved.",
      sent: "Report sent.",
      sentSimulated: "Report recorded — email is simulated, so nothing was actually sent.",
    },
    plan: {
      heading: "Plan",
      currentLabel: "Current plan",
      trialName: "Free trial",
      trialNote: "Billing is not connected yet — nothing will be charged.",
      viewPricing: "See plans",
    },
    data: {
      heading: "Data and privacy",
      points: [
        "Your data is stored in Canada.",
        "Connection tokens are encrypted at rest and never logged.",
        "Nothing is published to any connected account without your approval.",
        "Disconnecting a tool stops REYNAV reading from it immediately.",
      ],
      exportLabel: "Export my data",
      deleteLabel: "Delete organisation",
      destructiveNote: "Both of these arrive once the database is connected.",
    },
  } as const;
}

export type SettingsCopy = ReturnType<typeof settingsCopy>;
