// Product copy for the public pricing screen; vertical words come from the pack's labels.
// Prices are placeholders until commercial terms are fixed.
import type { VerticalLabels } from "@/shared/types/vertical";
import { siteCopy } from "./site";

export function pricingCopy(labels: VerticalLabels) {
  const site = siteCopy();
  return {
    ...site,
    meta: {
      title: "Pricing — REYNAV",
      description: `Simple plans for ${labels.businessPlural.toLowerCase()}. Start free for 14 days, no card needed.`,
    },
    hero: {
      eyebrow: "Pricing",
      headline: "Pick the plan that grows with you",
      lead: `Every plan includes the full scan, your Growth Score and a ranked list of opportunities. Start free for 14 days — no card, cancel any time.`,
      badges: ["14-day free trial", "No setup fees", "Cancel any time"],
    },
    billing: {
      label: "Billing period",
      monthly: { id: "monthly", label: "Monthly" },
      yearly: { id: "yearly", label: "Yearly" },
      saveNote: "Save 20%",
      monthlyNote: "Billed monthly in CAD",
      yearlyNote: "Billed yearly in CAD — two months free",
      perMonth: "/mo",
    },
    plans: [
      {
        id: "starter",
        name: "Starter",
        tagline: `For a single ${labels.business.toLowerCase()} getting found locally.`,
        monthly: 49,
        yearly: 39,
        badge: null,
        cta: { href: "/login", label: "Start Free Trial" },
        featuresLabel: "Includes",
        features: [
          "1 location",
          "Monthly market scan",
          "Growth Score with full breakdown",
          "Top 5 opportunities, ranked",
          "Google Business Profile insights",
          "Email support",
        ],
      },
      {
        id: "growth",
        name: "Growth",
        tagline: `For ${labels.businessPlural.toLowerCase()} ready to fill the calendar.`,
        monthly: 129,
        yearly: 103,
        badge: "Most popular",
        cta: { href: "/login", label: "Start Free Trial" },
        featuresLabel: "Everything in Starter, plus",
        features: [
          "Up to 3 locations",
          "Weekly market scan",
          "AI search visibility tracking",
          "AI content studio — 20 drafts a month",
          "AI review replies",
          `Booking system connection and ${labels.bookingPlural.toLowerCase()} attribution`,
          "Competitor tracking — 5 rivals",
          "Priority email support",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        tagline: "For multi-location groups and marketing teams.",
        monthly: 279,
        yearly: 223,
        badge: null,
        cta: { href: "/login", label: "Start Free Trial" },
        featuresLabel: "Everything in Growth, plus",
        features: [
          "Up to 10 locations",
          "Daily rank tracking",
          "Unlimited AI content drafts",
          "Competitor tracking — 20 rivals",
          "Team seats and approval workflow",
          "White-label weekly reports",
          "Named onboarding specialist",
        ],
      },
    ],
    enterprise: {
      eyebrow: "Enterprise",
      heading: "More than 10 locations?",
      body: "Franchises, groups and agencies get pooled scan credits, single sign-on, an API and a contract that fits how you buy.",
      points: ["Unlimited locations", "SSO and audit logs", "API access", "Dedicated success manager"],
      cta: { href: "/login", label: "Talk to us" },
    },
    comparison: {
      eyebrow: "Compare",
      heading: "What is in each plan",
      intro: "The detail, side by side. Every plan runs on the same engine — the plans differ in reach and how often REYNAV works for you.",
      planLabel: "Feature",
      groups: [
        {
          id: "scanning",
          label: "Scanning and scoring",
          rows: [
            { id: "locations", label: "Locations", values: ["1", "3", "10"] },
            { id: "scan", label: "Market scan", values: ["Monthly", "Weekly", "Weekly + daily ranks"] },
            { id: "score", label: "Growth Score", values: [true, true, true] },
            { id: "opportunities", label: "Ranked opportunities", values: ["Top 5", "Unlimited", "Unlimited"] },
            { id: "competitors", label: "Competitors tracked", values: ["—", "5", "20"] },
          ],
        },
        {
          id: "visibility",
          label: "Visibility",
          rows: [
            { id: "maps", label: "Google Maps rankings", values: [true, true, true] },
            { id: "listing", label: "Google Business Profile insights", values: [true, true, true] },
            { id: "ai", label: "AI search visibility", values: [false, true, true] },
            { id: "website", label: "Website health crawl", values: ["Home page", "Full site", "Full site"] },
          ],
        },
        {
          id: "content",
          label: "Content and reviews",
          rows: [
            { id: "drafts", label: "AI content drafts", values: ["—", "20 / month", "Unlimited"] },
            { id: "replies", label: "AI review replies", values: [false, true, true] },
            { id: "posts", label: "Google post scheduling", values: [false, true, true] },
            { id: "voice", label: "Brand voice training", values: [false, false, true] },
          ],
        },
        {
          id: "team",
          label: "Team and support",
          rows: [
            { id: "seats", label: "Team seats", values: ["1", "3", "10"] },
            { id: "reports", label: "Weekly report", values: ["Email", "Email", "White-label PDF"] },
            { id: "approvals", label: "Approval workflow", values: [false, false, true] },
            { id: "support", label: "Support", values: ["Email", "Priority email", "Named specialist"] },
          ],
        },
      ],
      yes: "Included",
      no: "Not included",
    },
    faq: {
      eyebrow: "Questions",
      heading: "Before you start",
      items: [
        {
          id: "trial",
          question: "What happens during the free trial?",
          answer: `You get the full Growth plan for 14 days. REYNAV runs a complete scan of your market, scores your presence and hands you a ranked plan. No card up front, and nothing charges automatically when the trial ends.`,
        },
        {
          id: "switch",
          question: "Can I change plans later?",
          answer: "Yes. Upgrade or downgrade whenever you like from your settings. Changes apply on your next billing date and we prorate the difference.",
        },
        {
          id: "contract",
          question: "Am I locked into a contract?",
          answer: "No. Monthly plans are month to month and you can cancel from your account in a couple of clicks. Yearly plans run for twelve months in exchange for the lower rate.",
        },
        {
          id: "locations",
          question: "How do you count locations?",
          answer: `One location is one address with its own Google Business Profile. If you run several ${labels.businessPlural.toLowerCase()} under one brand, each address counts as a location.`,
        },
        {
          id: "data",
          question: "Where does my data live?",
          answer: "In Canada. Connections are encrypted, we never post anything without your approval and you can disconnect a tool at any time.",
        },
        {
          id: "results",
          question: "How soon will I see results?",
          answer: `Your first scan finishes within a few hours and your Growth Score is ready the same day. Visibility usually starts moving within the first few weeks, and ${labels.bookingPlural.toLowerCase()} follow as the fixes take hold. We always show estimates as a range, never a single promised number.`,
        },
      ],
    },
    closing: {
      heading: "Start free. Decide later.",
      body: `Fourteen days of the full product, no card. See exactly where your next ${labels.customerPlural.toLowerCase()} will come from.`,
      primaryCta: { href: "/login", label: "Start Free Trial" },
      secondaryCta: { href: "/resources", label: "Browse Resources" },
    },
  } as const;
}

export type PricingCopy = ReturnType<typeof pricingCopy>;
