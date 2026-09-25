// Product copy for the profile screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function profileCopy(labels: VerticalLabels) {
  const business = labels.business.toLowerCase();
  return {
    title: "Profile",
    memberSince: "Member since {date}",
    visitWebsite: "Visit website",
    stats: {
      growthScore: "Growth Score",
      locations: "Locations",
      services: "Services",
      team: "Team members",
      notScored: "—",
    },
    completeness: {
      heading: "Profile strength",
      /** {percent} is filled in on the client. */
      percent: "{percent}% complete",
      intro: `A complete profile gives REYNAV more to work with, and makes every estimate for your ${business} sharper.`,
      allDone: "Everything is set up. Nicely done.",
      fix: "Set up",
      checks: {
        website: "Add your website",
        services: "Confirm the services you offer",
        address: "Add your location's address",
        listing: "Connect your Google Business Profile",
        bookings: "Connect bookings or upload a CSV",
        team: "Invite a teammate",
        prices: "Enter your service prices",
      },
    },
    you: {
      heading: "Your details",
      name: "Name",
      email: "Email",
      role: "Role",
      roles: { owner: "Owner", manager: "Manager", viewer: "Viewer", system: "System" },
    },
    business: {
      heading: `${labels.business} details`,
      name: "Business name",
      type: "Business type",
      industry: "Industry",
      website: "Website",
      noWebsite: "Not added",
      notSet: "Not set",
      services: "Services",
      segments: "Customer segments",
      editServices: "Edit in setup",
      noneYet: "None yet",
    },
    locations: {
      heading: "Locations",
      active: "Viewing",
      noAddress: "No address yet",
      manage: "Manage locations",
    },
    connections: {
      heading: "Connected accounts",
      manage: "Manage",
      labels: {
        website: "Website",
        "local-listing": "Google Business Profile",
        "search-performance": "Google Search Console",
        "web-analytics": "Google Analytics",
        "booking-source": "Booking system",
      },
      status: {
        disconnected: "Not connected",
        connecting: "Connecting",
        connected: "Connected",
        needs_reconnect: "Reconnect needed",
        failed: "Failed",
      },
    },
    preferences: {
      heading: "Preferences",
      weeklyReport: "Weekly report email",
      on: "On",
      off: "Off",
      manage: "Settings",
    },
    edit: { edit: "Edit", save: "Save", cancel: "Cancel", saving: "Saving…", saved: "Saved" },
    signOut: "Sign out",
    simulatedNote: "Connections are simulated while providers are mocked.",
  } as const;
}

export type ProfileCopy = ReturnType<typeof profileCopy>;
