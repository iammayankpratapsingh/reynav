// Product copy for the public legal screens (Privacy Policy, Terms of Service). Drafts written for a Canadian
// business under PIPEDA, Quebec's Law 25 and CASL; they must be reviewed by a Canadian lawyer before launch.
import { siteCopy } from "./site";

// TODO(legal): replace every bracketed value before launch. They appear on the public pages as written.
const company = {
  legalName: "[REYNAV legal entity name]",
  address: "[Registered business address, Ontario, Canada]",
  privacyEmail: "[privacy@your-domain]",
  supportEmail: "[support@your-domain]",
  privacyOfficer: "[Name of Privacy Officer]",
  province: "Ontario",
};

const lastUpdated = "28 September 2026";

export type LegalSection = {
  id: string;
  heading: string;
  paragraphs: readonly string[];
  list?: readonly string[];
};

function legalShell(title: string, description: string) {
  const site = siteCopy();
  return {
    ...site,
    meta: { title: `${title} — REYNAV`, description },
    hero: { eyebrow: "Legal", title, updatedLabel: "Last updated", updated: lastUpdated },
    contentsLabel: "On this page",
  };
}

export function privacyCopy() {
  const sections: LegalSection[] = [
    {
      id: "who-we-are",
      heading: "Who we are",
      paragraphs: [
        `REYNAV is operated by ${company.legalName} ("REYNAV", "we", "us"), ${company.address}. REYNAV helps local businesses understand their online visibility and grow their bookings.`,
        "This policy explains what personal information we collect, why, how we protect it and the choices you have. It applies to our website and to the REYNAV app.",
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      paragraphs: ["We collect only what we need to run REYNAV:"],
      list: [
        "Account details: your name, email address, password (stored hashed) and your role in the business.",
        "Business details: business name, website address, locations, services, prices and the other details you enter during onboarding.",
        "Connected account data: when you connect Google Business Profile, Google Search Console or Google Analytics, we read your listing, reviews, search performance and website traffic data.",
        "Booking data: files you upload or data from a booking system you connect. Our upload template asks for an anonymous customer ID, not customer names, emails or phone numbers.",
        "Public data: information about your business and nearby competitors that is publicly available, such as search rankings, public reviews and website content.",
        "Usage and device data: pages you visit, features you use, browser type, IP address and error reports, used to keep the service secure and to improve it.",
        "Messages: what you send to our support team or to the chat assistant on our website.",
      ],
    },
    {
      id: "how-we-use",
      heading: "How we use it",
      paragraphs: ["We use personal information to:"],
      list: [
        "Provide REYNAV: run scans, calculate your Growth Score, find opportunities and build your growth plan.",
        "Operate your account, including sign-in, security and customer support.",
        "Send service emails, such as scan results and weekly reports. We send marketing emails only with your consent, and every one includes an unsubscribe link.",
        "Process payments for paid plans.",
        "Improve the product, fix errors and protect against fraud and abuse.",
        "Meet our legal obligations.",
      ],
    },
    {
      id: "google-data",
      heading: "Google user data",
      paragraphs: [
        "REYNAV's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
        "We use Google data only to show you your own visibility, reviews, search and traffic results inside REYNAV. We do not sell Google data, use it for advertising or use it to train general AI models. You can disconnect Google at any time from Settings → Connections, or from your Google account permissions.",
      ],
    },
    {
      id: "ai",
      heading: "AI features",
      paragraphs: [
        "Some features use artificial intelligence to write explanations, recommendations and content drafts. We send AI providers only the information a task needs, and never passwords or access tokens.",
        "Scores and estimates in REYNAV are calculated by our own formulas, not by AI, and estimates are always shown as a range. AI-written content is a draft for you to review before you use it.",
      ],
    },
    {
      id: "consent",
      heading: "Consent",
      paragraphs: [
        "We collect, use and share personal information with your consent, except where the law allows otherwise. You give consent when you create an account, connect a service or accept optional cookies.",
        "You can withdraw consent at any time, subject to legal or contractual limits. If you do, some features may stop working. For example, disconnecting Google stops Google-based scores from updating.",
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      paragraphs: [
        "We do not sell personal information. We share it only with service providers who help us run REYNAV, under contracts that require them to protect it and use it only for the services they provide to us:",
      ],
      list: [
        "Hosting, database, file storage and sign-in",
        "Background job processing",
        "Search, ranking and competitor data providers",
        "Website crawling",
        "AI language model providers",
        "Email delivery",
        "Payment processing",
        "Error monitoring and product analytics",
        "The chat assistant on our website",
      ],
    },
    {
      id: "where-stored",
      heading: "Where your information is stored",
      paragraphs: [
        "Our main database is hosted in Canada. Some of our service providers, including AI, search data and email providers, may process information in other countries, mainly the United States. When that happens, your information may be subject to the laws of that country and accessible to its authorities.",
        "We assess the protections in place before transferring information outside Canada (and outside Quebec, for Quebec residents), and we require providers to protect it to a standard comparable to Canadian law.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      paragraphs: [
        "We keep personal information only as long as we need it for the purposes above. Detailed daily data, such as rankings and traffic, is kept for 90 days and then rolled up into weekly summaries.",
        "When you close your account, we delete or anonymize your information within 90 days, except what we must keep for legal, tax or accounting reasons.",
      ],
    },
    {
      id: "security",
      heading: "How we protect it",
      paragraphs: [
        "We use safeguards suited to the sensitivity of the information, including encryption in transit, encrypted storage of connection tokens, access controls that keep each business's data separate, and limited staff access.",
        "If a breach creates a real risk of significant harm, we will notify affected people and the Office of the Privacy Commissioner of Canada as the law requires.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      paragraphs: [
        "Essential cookies keep you signed in, keep the site secure and remember your cookie choices. With your OK, we also load our AI chat assistant, which stores data in your browser to keep your conversation. You can change your choice any time from Cookie settings in the footer.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      paragraphs: ["You can ask us to:"],
      list: [
        "Tell you what personal information we hold about you and how we use it",
        "Give you a copy of it",
        "Correct it if it is wrong or incomplete",
        "Delete it, where the law allows",
        "Stop using it for marketing",
      ],
    },
    {
      id: "requests",
      heading: "Making a request",
      paragraphs: [
        `Email our Privacy Officer, ${company.privacyOfficer}, at ${company.privacyEmail}. We will respond within 30 days. We may ask you to confirm your identity first.`,
        "If you are not satisfied with our answer, you can complain to the Office of the Privacy Commissioner of Canada (priv.gc.ca), or, in Quebec, to the Commission d'accès à l'information.",
      ],
    },
    {
      id: "businesses",
      heading: "Information about your customers",
      paragraphs: [
        "When a business uploads booking data or connects a booking system, the business decides what information is shared with REYNAV and is responsible for having the right to share it. We process that information only to provide REYNAV to that business.",
      ],
    },
    {
      id: "children",
      heading: "Children",
      paragraphs: ["REYNAV is a business tool and is not intended for anyone under 18."],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      paragraphs: [
        "We may update this policy. If a change is significant, we will tell you by email or in the app before it takes effect. The date at the top shows when it last changed.",
      ],
    },
  ];

  return {
    ...legalShell(
      "Privacy Policy",
      "How REYNAV collects, uses and protects personal information, and the choices you have.",
    ),
    intro: "Your privacy matters to us. This policy explains, in plain language, how we handle personal information.",
    sections,
  };
}

export function termsCopy() {
  const sections: LegalSection[] = [
    {
      id: "agreement",
      heading: "Agreement",
      paragraphs: [
        `These Terms of Service ("Terms") are an agreement between you and ${company.legalName} ("REYNAV", "we", "us"). By creating an account or using REYNAV, you agree to these Terms and to our Privacy Policy.`,
        "If you use REYNAV for a business, you confirm that you are authorized to accept these Terms on its behalf.",
      ],
    },
    {
      id: "service",
      heading: "The service",
      paragraphs: [
        "REYNAV analyzes your business's online presence and gives you scores, opportunities, recommendations, content drafts and reports. We may add, change or remove features over time. If we remove a major feature from a paid plan, we will tell you in advance.",
      ],
    },
    {
      id: "accounts",
      heading: "Your account",
      paragraphs: [
        "You must be at least 18 and give accurate information when you sign up. Keep your password safe; you are responsible for activity under your account. Tell us right away if you suspect unauthorized access.",
      ],
    },
    {
      id: "trial-billing",
      heading: "Free trial, plans and billing",
      paragraphs: [
        "New accounts may start with a 14-day free trial with no card required. Paid plans are billed in advance, monthly or yearly, and renew automatically until you cancel.",
        "You can cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period, and fees already paid are not refunded except where the law requires. Prices are shown before taxes, which are added where applicable. We will give you at least 30 days' notice of a price change.",
      ],
    },
    {
      id: "your-data",
      heading: "Your data",
      paragraphs: [
        "You own the data you bring to REYNAV. You give us permission to use it only to provide and improve the service, as described in our Privacy Policy.",
        "You are responsible for having the right to share any data you upload or connect, including information about your customers. You can export or delete your data at any time.",
      ],
    },
    {
      id: "connected-services",
      heading: "Connected services",
      paragraphs: [
        "REYNAV connects to services run by others, such as Google and booking platforms. Your use of those services is governed by their terms. We are not responsible for their availability or for changes they make that affect REYNAV.",
      ],
    },
    {
      id: "ai-estimates",
      heading: "AI content and estimates",
      paragraphs: [
        "REYNAV gives recommendations and estimates, such as missed bookings and revenue, based on the data available. Estimates are shown as ranges and are not promises of results. Search rankings and customer behaviour depend on factors outside our control.",
        "AI-written content is a draft. Review it before you publish, and make sure it is accurate and follows the rules of the platform where you post it. You are responsible for what you publish.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      paragraphs: ["You agree not to:"],
      list: [
        "Break the law or anyone else's rights using REYNAV",
        "Post fake reviews or misleading content, or use REYNAV to manipulate reviews",
        "Send messages that break Canada's Anti-Spam Legislation (CASL)",
        "Access another business's data, or try to get around our security",
        "Copy, resell or reverse engineer REYNAV",
        "Overload the service or scrape it with automated tools",
      ],
    },
    {
      id: "ip",
      heading: "Our intellectual property",
      paragraphs: [
        "REYNAV, including its software, design, scoring formulas and brand, belongs to us. We give you a limited, non-transferable right to use it while your account is active. Content that REYNAV drafts for you is yours to use for your business.",
      ],
    },
    {
      id: "termination",
      heading: "Suspension and termination",
      paragraphs: [
        "You can close your account at any time. We may suspend or close an account that breaks these Terms or puts the service or other users at risk. Where we can, we will warn you first and give you a chance to export your data.",
      ],
    },
    {
      id: "disclaimers",
      heading: "Disclaimers",
      paragraphs: [
        'REYNAV is provided "as is". To the extent the law allows, we do not guarantee that it will be uninterrupted or error-free, or that it will achieve any particular ranking, booking or revenue result.',
      ],
    },
    {
      id: "liability",
      heading: "Limitation of liability",
      paragraphs: [
        "To the extent the law allows, we are not liable for indirect or consequential losses, such as lost profits or lost data. Our total liability for any claim is limited to the fees you paid us in the 12 months before the claim.",
        "Nothing in these Terms limits rights you have under consumer protection laws that cannot be waived.",
      ],
    },
    {
      id: "law",
      heading: "Governing law",
      paragraphs: [
        `These Terms are governed by the laws of ${company.province} and the federal laws of Canada that apply there. Any dispute will be heard in the courts of ${company.province}.`,
      ],
    },
    {
      id: "changes",
      heading: "Changes to these Terms",
      paragraphs: [
        "We may update these Terms. If a change is significant, we will tell you by email or in the app at least 30 days before it takes effect. If you keep using REYNAV after that, the new Terms apply.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: [`Questions about these Terms? Email ${company.supportEmail} or write to ${company.address}.`],
    },
  ];

  return {
    ...legalShell("Terms of Service", "The terms that apply when you use REYNAV."),
    intro: "Please read these terms carefully. They explain your rights and ours when you use REYNAV.",
    sections,
  };
}

export type LegalCopy = ReturnType<typeof privacyCopy>;
