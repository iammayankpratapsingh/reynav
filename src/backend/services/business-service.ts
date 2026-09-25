import "server-only";
// Business and location business logic: reading the website into a profile and saving what the owner confirms.
import { getWebCrawler } from "@/backend/adapters/web-crawler";
import * as businessesRepository from "@/backend/db/repositories/businesses";
import { logger } from "@/backend/lib/logger";
import { ValidationError } from "@/shared/errors";
import { SaveProfileSchema } from "@/shared/schemas/business";
import type { BusinessProfile } from "@/shared/types/business";
import type { OnboardingState } from "@/shared/types/onboarding";
import type { TenantContext } from "@/shared/types/tenant";
import type { VerticalBusinessType } from "@/shared/types/vertical";
import { getVertical } from "@/verticals";
import { requireManager, setWebsite } from "./connection-service";
import { getOnboardingState, requirePrimaryBusiness } from "./onboarding-service";

/** Saves the website, reads it, and stores what it says as the starting profile for the owner to edit. */
export async function analyseWebsite(ctx: TenantContext, input: unknown): Promise<OnboardingState> {
  const websiteUrl = await setWebsite(ctx, input);
  const business = await requirePrimaryBusiness(ctx);
  const pack = getVertical(business.verticalId);

  const site = await getWebCrawler().readProfile({ url: websiteUrl });
  const profile: BusinessProfile = {
    businessTypeId: guessBusinessType(pack.manifest.businessTypes, site.categoryHints),
    services: uniqueNames(site.serviceTerms),
    segments: uniqueNames(site.audienceTerms),
  };

  await businessesRepository.saveProfile(ctx, business.id, profile);
  logger.info({
    message: "website profile read",
    organizationId: ctx.organizationId,
    services: profile.services.length,
    segments: profile.segments.length,
  });
  return getOnboardingState(ctx);
}

export async function saveProfile(ctx: TenantContext, input: unknown): Promise<OnboardingState> {
  requireManager(ctx);
  const parsed = SaveProfileSchema.parse(input);
  const business = await requirePrimaryBusiness(ctx);

  const types = getVertical(business.verticalId).manifest.businessTypes;
  if (!types.some((type) => type.id === parsed.businessTypeId)) {
    throw new ValidationError(`Unknown business type ${parsed.businessTypeId}`, "Pick your business type.");
  }

  await businessesRepository.saveProfile(ctx, business.id, {
    businessTypeId: parsed.businessTypeId,
    services: uniqueNames(parsed.services),
    segments: uniqueNames(parsed.segments),
  });
  return getOnboardingState(ctx);
}

/** The type whose keywords appear most often in what the site calls itself; the first type when nothing matches. */
function guessBusinessType(types: readonly VerticalBusinessType[], hints: readonly string[]): string | null {
  const text = hints.join(" ").toLowerCase();
  let best: { id: string; hits: number } | null = null;
  for (const type of types) {
    const hits = type.keywords.filter((keyword) => text.includes(keyword)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { id: type.id, hits };
  }
  return best?.id ?? types[0]?.id ?? null;
}

/** Trims, drops blanks and removes case-insensitive duplicates, keeping the first spelling seen. */
function uniqueNames(names: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of names) {
    const name = raw.trim().replace(/\s+/g, " ");
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}
