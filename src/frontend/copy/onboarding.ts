// Product copy for the onboarding wizard; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function onboardingCopy(labels: VerticalLabels) {
  const business = labels.business.toLowerCase();
  const bookings = labels.bookingPlural.toLowerCase();

  return {
    brand: "REYNAV",
    /** Copy crosses to a client component, so placeholders are filled in there. */
    progress: "Step {current} / {total}",
    simulatedNote: "Connections are simulated while providers are mocked. No real account is linked.",
    nav: {
      back: "Back",
      continue: "Continue",
      skip: "Skip for now",
      saving: "Saving…",
    },
    business: {
      heading: "Where is your business online?",
      intro: "We read your site to find your services before anything else.",
      inputLabel: "Website address",
      placeholder: "yourbusiness.ca",
      analyse: "Analyse",
      reanalyse: "Re-analyse",
      analysing: "Reading your site…",
      typeLabel: "Business type",
      /** {count} is filled in on the client. */
      servicesLabel: "{count} services detected — remove anything you don't offer",
      servicesEmptyLabel: "Services — add what you offer",
      segmentsLabel: "{count} customer segments detected",
      segmentsEmptyLabel: "Customer segments",
      add: "Add",
      addPlaceholder: "Type and press Enter",
      remove: "Remove {name}",
      needsAnalysis: "Enter your website and press Analyse to continue.",
      needsService: "Keep at least one service.",
    },
    google: {
      heading: "Connect your Google tools",
      intro: `These make the scan sharper. Not every ${business} has them — skip any you don't use.`,
      providers: {
        "local-listing": {
          title: "Google Business Profile",
          description: "Your Maps listing, reviews, photos and address.",
        },
        "search-performance": {
          title: "Google Search Console",
          description: "Which searches show your site, and where it ranks.",
        },
        "web-analytics": {
          title: "Google Analytics",
          description: "Who visits your site and what they do there.",
        },
      },
      connect: "Connect",
      connecting: "Connecting…",
      disconnect: "Disconnect",
      retry: "Try again",
      failed: "That did not connect. Try again.",
      locationHeading: "Business location",
      locationFetched: "Filled in from your Google Business Profile — check it's right.",
      locationManual: "Connect your Business Profile to fill this in, or type it yourself.",
      fields: {
        street: "Street address",
        city: "City",
        region: "Province / State",
        postalCode: "Postal code",
      },
    },
    bookings: {
      heading: `Where do your ${bookings} live?`,
      intro: `Link your booking platform, or upload a CSV export, so we can tie searches to real ${bookings}.`,
      platformsLabel: "Booking platform",
      other: "Other platform",
      otherPlaceholder: "Choose a platform",
      connect: "Connect",
      connecting: "Connecting…",
      connected: "Connected",
      disconnect: "Disconnect",
      orDivider: "or upload a CSV",
      upload: "Choose CSV file",
      uploading: "Checking your file…",
      uploadHint: "Follow the template on the right. Max 5 MB.",
      /** {rows}, {from} and {to} are filled in on the client. */
      uploaded: "{rows} bookings imported · {from} to {to}",
      replace: "Replace file",
      removeFile: "Remove",
      template: {
        intro: "Your CSV must follow this format — download the template and fill in one row per booking.",
        download: "Download template",
      },
    },
    review: {
      heading: "Check everything looks right",
      intro: "Anything wrong? Edit it now — the scan uses exactly what's here.",
      edit: "Edit",
      notConnected: "Not connected",
      notAdded: "Not added",
      skipped: "Skipped",
      rows: {
        website: "Website",
        businessType: "Business type",
        services: "Services",
        segments: "Customer segments",
        location: "Location",
        "local-listing": "Google Business Profile",
        "search-performance": "Google Search Console",
        "web-analytics": "Google Analytics",
        bookings: "Booking data",
      },
      start: "Looks good — start scan",
      starting: "Starting…",
    },
    errors: {
      unexpected: "Something went wrong. Please try again.",
    },
  } as const;
}

export type OnboardingCopy = ReturnType<typeof onboardingCopy>;
