// Product copy for the competitors screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function competitorsCopy(labels: VerticalLabels) {
  const business = labels.businessPlural.toLowerCase();
  return {
    title: "Competitors",
    /** {count} and {location} are filled in on the client. */
    subtitle: `{count} ${business} competing with you for the same searches near {location}.`,
    scannedPrefix: "From your scan on",
    you: "You",
    changes: {
      heading: "What changed",
      intro: "Where nearby competitors are out-working you right now.",
      /** {name}, {theirs} and {yours} are filled in on the client. */
      reviews: "{name} added {theirs} reviews in the last 30 days — you added {yours}.",
      posts: "{name} published {theirs} Google posts in 90 days — you published {yours}.",
      photos: "{name} has {theirs} photos on their profile — you have {yours}.",
      empty: "Nobody is clearly out-working you this period.",
    },
    table: {
      heading: "Side by side",
      caption: "You and nearby competitors, as of your latest scan",
      business: "Business",
      rating: "Rating",
      reviews: "Reviews",
      reviewGrowth: "Last 30 days",
      services: "Services",
      pages: "Web pages",
      posts: "Posts (90 days)",
      photos: "Photos",
      mapPosition: "Avg. map position",
      noWebsite: "No website",
      notShowing: "Not showing",
      /** {change} is filled in on the client. */
      growthVsPrevious: "{change} vs previous 30",
    },
    maps: {
      heading: "Google Maps ranking by service",
      intro: "Your best map position for each service against the strongest competitor.",
      service: "Service",
      you: "You",
      best: "Best competitor",
      ahead: "Competitors ahead of you",
      notShowing: "Not showing",
    },
    pages: {
      heading: "Pages they have that you don't",
      intro: "Topics at least two competitors cover on their websites that your site does not.",
      /** {count} is filled in on the client. */
      competitorsCount: "{count} competitors",
      empty: "Your website covers every topic your competitors do.",
    },
    empty: {
      heading: "No competitor data yet",
      body: "Your next scan finds the ten businesses you compete with most and compares you side by side.",
      cta: { href: "/dashboard", label: "Go to Home" },
    },
    simulatedNote: "Simulated competitor data while providers are mocked.",
  } as const;
}

export type CompetitorsCopy = ReturnType<typeof competitorsCopy>;
