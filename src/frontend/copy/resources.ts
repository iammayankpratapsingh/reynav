// Product copy for the public resources screen. Placeholder entries until the library is written.
import type { VerticalLabels } from "@/shared/types/vertical";
import { siteCopy } from "./site";

export function resourcesCopy(labels: VerticalLabels) {
  const site = siteCopy();
  const business = labels.business.toLowerCase();
  const businesses = labels.businessPlural.toLowerCase();
  const customers = labels.customerPlural.toLowerCase();
  const bookings = labels.bookingPlural.toLowerCase();

  return {
    ...site,
    meta: {
      title: "Resources — REYNAV",
      description: `Guides, playbooks and plain-language explainers on getting more ${customers} for your ${business}.`,
    },
    hero: {
      eyebrow: "Resources",
      headline: "Learn the craft of getting found",
      lead: `Everything we know about local search, Google Business Profile, AI assistants and turning attention into ${bookings} — written for ${businesses}, not for marketers.`,
      note: "We are writing the full library now. Here is what is coming, and roughly when.",
    },
    categories: {
      heading: "Browse by type",
      intro: "Four kinds of resource, each with a different job.",
      status: { soon: "Coming soon", live: "Available" },
      items: [
        {
          id: "guides",
          icon: "guide",
          title: "Guides",
          summary: `Step-by-step walkthroughs of one job: claiming your Google Business Profile, writing a service page, asking for reviews without feeling pushy.`,
          meta: "8 guides planned",
          status: "soon",
        },
        {
          id: "playbooks",
          icon: "playbook",
          title: "Playbooks",
          summary: `A 30, 60 or 90-day plan you can run end to end. Each playbook names the actions, the order and what to measure.`,
          meta: "3 playbooks planned",
          status: "soon",
        },
        {
          id: "benchmarks",
          icon: "benchmark",
          title: "Benchmarks",
          summary: `What good looks like for a ${business} your size: typical rankings, review counts, conversion rates and content volume, shown as ranges.`,
          meta: "Updated each quarter",
          status: "soon",
        },
        {
          id: "help",
          icon: "help",
          title: "Help centre",
          summary: "How REYNAV works under the hood: connecting your tools, reading your Growth Score, approving AI drafts and managing your team.",
          meta: "Ships with your account",
          status: "soon",
        },
      ],
    },
    library: {
      eyebrow: "In the works",
      heading: "First in the library",
      intro: "A preview of the pieces we are writing first. Titles may change.",
      readTimeLabel: "read",
      items: [
        {
          id: "map-pack",
          kind: "Guide",
          title: "How the Google map pack actually picks three businesses",
          summary: `Distance, relevance and prominence, explained without jargon — and which of the three you can genuinely influence.`,
          readTime: "7 min",
        },
        {
          id: "ai-answers",
          kind: "Guide",
          title: `What ChatGPT says when someone asks for a ${business} near them`,
          summary: "Where AI assistants get their answers, why some businesses get named and what to put on your site so you are one of them.",
          readTime: "6 min",
        },
        {
          id: "reviews",
          kind: "Playbook",
          title: "The 30-day review playbook",
          summary: `A month of small, repeatable asks that lift both your rating and the number of service-specific reviews Google can read.`,
          readTime: "11 min",
        },
        {
          id: "service-pages",
          kind: "Guide",
          title: "One page per service, and why it beats one long page",
          summary: "How to split your services into pages people and search engines both understand, with a structure you can copy.",
          readTime: "8 min",
        },
        {
          id: "booking-flow",
          kind: "Playbook",
          title: `From click to booked: fixing the five steps that lose ${customers}`,
          summary: `The common drop-off points between someone finding you and finishing a booking, and the fix for each one.`,
          readTime: "9 min",
        },
        {
          id: "glossary",
          kind: "Benchmarks",
          title: `What a healthy ${business} presence looks like`,
          summary: "Typical ranges for rankings, reviews, site speed and booking conversion, so you know whether your numbers need work.",
          readTime: "5 min",
        },
      ],
    },
    notify: {
      eyebrow: "Stay in the loop",
      heading: "Want these as they land?",
      body: "Start a free trial and you will get each guide by email as we publish it, alongside your weekly REYNAV report. No separate signup, no spam.",
      points: [
        "New guides and playbooks as they publish",
        "Quarterly benchmarks for your vertical",
        "Product updates in plain language",
      ],
      cta: { href: "/login", label: "Start Free Trial" },
    },
    closing: {
      heading: "Reading is good. Doing is better.",
      body: `Run a free scan and REYNAV will tell you which of these to read first, based on what your ${business} actually needs.`,
      primaryCta: { href: "/login", label: "Start Free Trial" },
      secondaryCta: { href: "/pricing", label: "See Pricing" },
    },
  } as const;
}

export type ResourcesCopy = ReturnType<typeof resourcesCopy>;
