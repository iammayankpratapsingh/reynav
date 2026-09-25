// Product copy for the authenticated shell: sidebar navigation and account row.

export function appShellCopy() {
  return {
    brand: "REYNAV",
    nav: {
      label: "Sections",
      openMenu: "Open navigation",
      closeMenu: "Close navigation",
      soon: "Soon",
      soonHint: "Not available yet",
      items: [
        { id: "home", label: "Home", href: "/dashboard", ready: true },
        { id: "opportunities", label: "Opportunities", href: "/opportunities", ready: true },
        { id: "growth-plan", label: "Growth Plan", href: "/growth-plan", ready: true },
        { id: "competitors", label: "Competitors", href: "/competitors", ready: true },
        { id: "services", label: "Services", href: "/services", ready: true },
        { id: "ai-search", label: "AI Search", href: "/ai-search", ready: true },
        { id: "content", label: "Content", href: "/content", ready: true },
        { id: "reviews", label: "Reviews", href: "/reviews", ready: true },
        { id: "campaigns", label: "Campaigns", href: "/campaigns", ready: true },
        { id: "bookings", label: "Bookings", href: "/bookings", ready: true },
        { id: "reports", label: "Reports", href: "/reports", ready: true },
        { id: "locations", label: "All Locations", href: "/locations", ready: true },
        { id: "settings", label: "Settings", href: "/settings", ready: true },
      ],
    },
    location: {
      label: "Location",
      switching: "Switching…",
    },
    account: {
      signOut: "Sign out",
    },
  } as const;
}

export type AppShellCopy = ReturnType<typeof appShellCopy>;
