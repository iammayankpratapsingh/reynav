// Product copy for the all-locations screen.

export function locationsCopy() {
  return {
    title: "All Locations",
    subtitle: "Every location's Growth Score and biggest opportunity, side by side.",
    /** {score} is filled in on the client. */
    average: "Average Growth Score {score}",
    active: "Viewing",
    open: "Open",
    lastScan: "Last scan",
    never: "Not scanned yet",
    topOpportunity: "Top opportunity",
    noOpportunity: "—",
    vsPrevious: "vs previous",
    subLabels: {
      visibility: "Visibility",
      maps: "Maps",
      website: "Website",
      "ai-search": "AI",
      reviews: "Reviews",
      conversion: "Conversion",
    } as Record<string, string>,
    add: {
      heading: "Add a location",
      intro: "Each location gets its own scan, Growth Score and opportunities.",
      street: "Street address",
      city: "City",
      region: "Province / State",
      postalCode: "Postal code",
      submit: "Add location",
      submitting: "Adding…",
    },
  } as const;
}

export type LocationsCopy = ReturnType<typeof locationsCopy>;
