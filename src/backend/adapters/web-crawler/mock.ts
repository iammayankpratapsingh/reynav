import "server-only";
// Mock WebCrawler: a deterministic site that is decent but slow, thin on service pages and hides its booking link,
// and whose menu lists a typical beauty business's services.
import type { CrawlResult, SiteProfile, WebCrawler } from "./types";

export class MockWebCrawler implements WebCrawler {
  async crawl(): Promise<CrawlResult> {
    return {
      loadMs: 3400,
      isMobileFriendly: true,
      hasBookingLinkAboveFold: false,
      servicePageCount: 5,
      pagesMissingMetadata: 5,
      totalPages: 14,
      hasStructuredData: true,
      pageTopics: ["Haircut", "Balayage", "Hair Colour", "Bridal Makeup", "Highlights", "About", "Contact"],
      source: "mock",
      fetchedAt: new Date(),
    };
  }

  async readProfile({ url }: { url: string }): Promise<SiteProfile> {
    // Simulates the time a real crawl spends fetching and reading pages.
    await new Promise((resolve) => setTimeout(resolve, PROFILE_READ_MS));
    return {
      businessName: nameFromUrl(url),
      categoryHints: ["hair salon", "beauty salon"],
      serviceTerms: [
        "Haircut",
        "Balayage",
        "Highlights",
        "Hair colour",
        "Keratin",
        "Extensions",
        "Facials",
        "Waxing",
        "Threading",
        "Laser",
        "Bridal makeup",
      ],
      audienceTerms: ["Women", "Men", "Brides", "South Asian customers", "Families", "Professionals"],
      source: "mock",
      fetchedAt: new Date(),
    };
  }
}

const PROFILE_READ_MS = 1200;

/** "https://www.styloria.ca" → "Styloria". Good enough for a placeholder the owner can correct. */
function nameFromUrl(url: string): string | null {
  try {
    const label = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
    return label ? label.charAt(0).toUpperCase() + label.slice(1) : null;
  } catch {
    return null;
  }
}
