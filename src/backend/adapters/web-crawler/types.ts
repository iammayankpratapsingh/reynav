import "server-only";
// WebCrawler: what the website looks like to a visitor and to a search engine.

export type CrawlResult = {
  /** Largest Contentful Paint in milliseconds. */
  loadMs: number;
  isMobileFriendly: boolean;
  hasBookingLinkAboveFold: boolean;
  servicePageCount: number;
  pagesMissingMetadata: number;
  totalPages: number;
  hasStructuredData: boolean;
  /** Topics of the site's pages, e.g. a service name, "Pricing", "Gallery". */
  pageTopics: string[];
  source: string;
  fetchedAt: Date;
};

/** What the site says about the business, in its own words. Matching to a vertical happens in the service. */
export type SiteProfile = {
  businessName: string | null;
  /** Phrases describing what kind of business this is, e.g. from the title, headings or schema.org type. */
  categoryHints: string[];
  /** Service names as listed on the site's menu or service pages. */
  serviceTerms: string[];
  /** Who the site speaks to, e.g. audiences named in headings and copy. */
  audienceTerms: string[];
  source: string;
  fetchedAt: Date;
};

export interface WebCrawler {
  crawl(input: { url: string }): Promise<CrawlResult>;
  readProfile(input: { url: string }): Promise<SiteProfile>;
}
