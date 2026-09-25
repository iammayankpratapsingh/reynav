// Product copy for the home (landing) screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";
import { siteCopy } from "./site";

export function homeCopy(labels: VerticalLabels) {
  const site = siteCopy();
  return {
    ...site,
    hero: {
      eyebrow: `AI Marketing for ${labels.businessPlural}`,
      headlineLines: ["More Visibility.", "More Bookings.", "More Revenue."],
      tagline: `For ${labels.businessPlural}, By ${labels.business} Experts.`,
      description: `Connect your website, Google Business Profile and booking system. REYNAV helps identify opportunities, create content and help you get more ${labels.bookingPlural.toLowerCase()}.`,
      primaryCta: { href: "/login", label: "Start Free Trial" },
      secondaryCta: { href: "#demo", label: "Watch Demo" },
      imageSlogan: ["Beautiful", "Business", "Growth"],
    },
    features: {
      heading: "What REYNAV connects",
      items: [
        { id: "listing", label: "Google Business" },
        { id: "website", label: "Your Website" },
        { id: "booking", label: "Booking System" },
        { id: "ai", label: "AI Growth" },
        { id: "customers", label: `More ${labels.customerPlural}` },
      ],
    },
    featureGrid: {
      eyebrow: "Features",
      heading: "Everything you need to grow",
      intro: `One platform that finds new ${labels.customerPlural.toLowerCase()}, tells you what to fix and does the heavy lifting for you.`,
      cards: [
        {
          id: "maps",
          title: "Local map visibility",
          body: "See where you show up on Google Maps for every service you offer, and who shows up instead.",
          visual: { you: "You", others: "Nearby competitors" },
        },
        {
          id: "ai-search",
          title: "AI search visibility",
          body: "Know what ChatGPT, Gemini and other AI assistants say when people ask for recommendations.",
          visual: {
            question: `Who is the best ${labels.business.toLowerCase()} near me?`,
            answer: "Here are a few top-rated options nearby. Your business stands out for its reviews and easy online booking.",
          },
        },
        {
          id: "score",
          title: "Growth Score",
          body: "One clear score for your whole online presence, broken down so you know exactly where to improve.",
          visual: { label: "Growth Score", parts: ["Visibility", "Maps", "Website", "AI", "Reviews", "Conversion"] },
        },
        {
          id: "opportunities",
          title: "Opportunity finder",
          body: "REYNAV ranks what to do next by likely impact, so your time goes where it matters most.",
          visual: { items: ["Service page gap", "Review requests", "Booking button", "Google posts"] },
        },
        {
          id: "content",
          title: "AI content studio",
          body: "Service pages, Google posts and social captions drafted in your voice, ready to approve.",
          visual: {
            kind: "Google post",
            text: "New this week: evening availability is open. Book online in under a minute.",
            action: "Publish",
          },
        },
        {
          id: "reviews",
          title: "Review replies",
          body: "Thoughtful, on-brand replies to every review, drafted for you to approve.",
          visual: {
            review: "Loved my visit. The team was so welcoming!",
            reply: "Thank you so much! We loved having you and can't wait to see you again.",
            badge: "AI draft",
          },
        },
        {
          id: "bookings",
          title: `${labels.bookingPlural} and revenue`,
          body: `Connect your booking system to see which searches turn into real ${labels.bookingPlural.toLowerCase()}, with estimates always shown as a range.`,
          visual: { legend: ["Searches", labels.bookingPlural] },
        },
      ],
    },
    howItWorks: {
      eyebrow: "How it works",
      heading: "Your data in. Growth out.",
      intro: "REYNAV connects to the tools you already use, analyses your market with AI and turns it into a clear plan.",
      engineLabel: "REYNAV",
      engineSub: "AI growth engine",
      engineTasks: ["Search demand", "Rankings", "AI visibility", "Competitors", "Website crawl"],
      sourcesLabel: "Your tools",
      outputsLabel: "What you get",
      selectHint: "Tap a source to see what REYNAV does with it",
      sources: [
        { id: "website", label: "Website", detail: "Crawls your pages for speed, content gaps and how easy it is to book." },
        { id: "listing", label: "Google Business Profile", detail: "Reads your listing, photos, categories and reviews to spot quick wins." },
        { id: "search", label: "Search Console", detail: "Pulls the searches and pages you already appear for on Google." },
        { id: "analytics", label: "Analytics", detail: "Measures your visits and where they come from." },
        { id: "booking", label: "Booking system", detail: `Links ${labels.bookingPlural.toLowerCase()} back to the searches that brought them in.` },
      ],
      outputs: [
        { id: "score", label: "Growth Score" },
        { id: "opportunities", label: "Top opportunities" },
        { id: "content", label: "AI content" },
        { id: "reports", label: "Weekly reports" },
      ],
      trust: ["Encrypted connections", "Data stored in Canada", "No code needed"],
    },
    journey: {
      eyebrow: "Your journey",
      heading: "Your growth journey",
      intro: `From the first connection to a calendar full of ${labels.bookingPlural.toLowerCase()}, this is the road REYNAV drives with you.`,
      youLabel: "You",
      reynavLabel: "REYNAV",
      stepLabel: "Step",
      previewNote: "Illustrative preview",
      steps: [
        {
          id: "connect",
          title: "Connect your tools",
          body: "Link your website, Google Business Profile and booking system in a few clicks. No code and no setup calls.",
          you: "Your website address and logins",
          reynav: "Connects securely and keeps your data in sync",
          preview: {
            heading: "Connections",
            items: ["Website", "Google Business Profile", "Booking system"],
            pending: "Connecting",
            done: "Connected",
          },
        },
        {
          id: "scan",
          title: "REYNAV scans your market",
          body: "We check how people search for your services nearby, where you rank, what AI assistants say about you and how local competitors compare.",
          you: "Nothing. Grab a coffee.",
          reynav: "Runs the full scan in the background",
          preview: {
            heading: "Scan in progress",
            items: ["Local search demand", "Google rankings", "AI search visibility", "Nearby competitors", "Website health"],
            waiting: "Waiting",
            running: "Scanning",
            done: "Done",
          },
        },
        {
          id: "score",
          title: "See your Growth Score",
          body: "One clear score shows where you stand today across visibility, maps, website, AI search, reviews and conversion.",
          you: "Review where you stand",
          reynav: "Explains every part in plain language",
          preview: {
            heading: "Growth Score",
            items: ["Visibility", "Google Maps", "Website", "AI Search", "Reviews", "Conversion"],
          },
        },
        {
          id: "opportunities",
          title: "Get your top opportunities",
          body: `REYNAV ranks what will bring in the most new ${labels.customerPlural.toLowerCase()} first: high-demand services you are missing, review gaps and website fixes.`,
          you: "Pick what to tackle first",
          reynav: "Ranks every opportunity by likely impact",
          preview: {
            heading: "Top opportunities",
            items: [
              { title: "Top service page", note: "High demand, low visibility", impact: "High impact", tone: "high" },
              { title: "Google reviews", note: "Needs more service-specific reviews", impact: "Medium", tone: "medium" },
              { title: "Website booking button", note: "Not prominent enough", impact: "Medium", tone: "medium" },
            ],
          },
        },
        {
          id: "content",
          title: "Create content that ranks",
          body: "AI drafts service pages, Google posts and review replies in your voice, built around what people actually search for.",
          you: "Approve and publish",
          reynav: "Writes, formats and schedules",
          preview: {
            heading: "Drafting with AI",
            items: ["Service page", "Google post", "Review reply"],
            ready: "Ready to publish",
            writing: "Writing",
          },
        },
        {
          id: "results",
          title: "Track real results",
          body: `Watch visibility and ${labels.bookingPlural.toLowerCase()} move week by week, with fresh opportunities after every scan.`,
          you: "Keep doing great work",
          reynav: "Re-scans weekly and reports progress",
          preview: {
            heading: "Weekly progress",
            items: ["Visibility", labels.bookingPlural],
          },
        },
      ],
      finish: {
        title: `More ${labels.customerPlural}. More ${labels.bookingPlural}. A growing business.`,
        body: "The road does not end here. Every week REYNAV finds the next opportunity, so growth keeps compounding.",
      },
    },
    closing: {
      heading: "Ready to start your journey?",
      body: `Connect your tools today and see exactly where your next ${labels.customerPlural.toLowerCase()} will come from.`,
      primaryCta: { href: "/login", label: "Start Free Trial" },
      secondaryCta: { href: "#demo", label: "Watch Demo" },
    },
  } as const;
}

export type HomeCopy = ReturnType<typeof homeCopy>;
