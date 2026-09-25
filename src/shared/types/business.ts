// Business and location domain types. Vertical-agnostic: a business belongs to a vertical by id.

/** What the owner confirmed their business is and offers. Free text, because websites say what they like. */
export type BusinessProfile = {
  /** One of the vertical pack's business types, e.g. a sub-type inside the vertical. */
  businessTypeId: string | null;
  services: string[];
  segments: string[];
};

export type PostalAddress = {
  street: string;
  city: string;
  region: string;
  postalCode: string;
};

/** Where an address came from, so the review step can say whether it was fetched or typed. */
export type AddressSource = "listing" | "manual";

export type Business = {
  id: string;
  organizationId: string;
  name: string;
  verticalId: string;
  websiteUrl: string | null;
  profile: BusinessProfile | null;
  /** ISO 8601. Set once onboarding hands off to the first scan. */
  onboardedAt: string | null;
};

export type Location = {
  id: string;
  organizationId: string;
  businessId: string;
  /** Display line such as "Brampton, ON". */
  label: string;
  address: PostalAddress | null;
  addressSource: AddressSource | null;
};
