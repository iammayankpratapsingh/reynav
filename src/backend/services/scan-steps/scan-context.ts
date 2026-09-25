import "server-only";
// The inputs every scan step shares: who is being scanned, where, and which keywords to check.
// Built once per scan so each step is a thin fetch-and-score.
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as locationsRepository from "@/backend/db/repositories/locations";
import { NotFoundError } from "@/shared/errors";
import type { GeoTarget } from "@/shared/types/geo";
import type { TenantContext } from "@/shared/types/tenant";
import type { VerticalPack } from "@/shared/types/vertical";
import { slugify } from "@/shared/lib/slug";
import { getVertical } from "@/verticals";

/** A service the scan checks: the pack's slug when the owner's name matches one, else a slug of their name. */
export type ScanService = { slug: string; name: string };

export type ScanContext = {
  tenant: TenantContext;
  scanId: string;
  businessName: string;
  /** The services the owner confirmed in onboarding, or the pack's list when there is no profile yet. */
  serviceNames: string[];
  services: ScanService[];
  websiteUrl: string;
  locationId: string;
  geo: GeoTarget;
  city: string;
  pack: VerticalPack;
  keywords: readonly string[];
  /** Which service each keyword is about, so an opportunity can be named after it. */
  keywordService: ReadonlyMap<string, string>;
  aiPrompts: readonly AiPrompt[];
};

/** A question put to AI answers, and the service it is about (null for questions about the business type). */
export type AiPrompt = { prompt: string; serviceSlug: string | null; serviceName: string | null };

/** How many of the top services get their own AI question. */
const AI_SERVICE_PROMPTS = 6;

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match).toLowerCase();
}

export async function buildScanContext(ctx: TenantContext, scanId: string): Promise<ScanContext> {
  const [business, location] = await Promise.all([
    businessesRepository.findPrimary(ctx),
    locationsRepository.findPrimary(ctx),
  ]);
  if (!business || !location) throw new NotFoundError(`Incomplete workspace for ${ctx.organizationId}`);
  if (!business.websiteUrl) throw new NotFoundError(`No website set for ${ctx.organizationId}`);

  const pack = getVertical(business.verticalId);
  const city = location.label.split(",")[0]!.trim();
  const businessWord = pack.manifest.labels.business;

  const services = resolveServices(business.profile?.services ?? null, pack);
  const keywordService = new Map<string, string>();
  const keywords: string[] = [];
  for (const service of services) {
    for (const template of pack.keywords.templates) {
      const keyword = fill(template, { service: service.name, city, business: businessWord });
      keywords.push(keyword);
      keywordService.set(keyword, service.slug);
    }
  }
  for (const template of pack.keywords.brandTemplates) {
    keywords.push(fill(template, { city, business: businessWord }));
  }

  const aiPrompts = pack.keywords.aiPromptTemplates.flatMap((template): AiPrompt[] =>
    template.includes("{service}")
      ? services.slice(0, AI_SERVICE_PROMPTS).map((service) => ({
          prompt: fill(template, { service: service.name, city, business: businessWord }),
          serviceSlug: service.slug,
          serviceName: service.name,
        }))
      : [{ prompt: fill(template, { city, business: businessWord }), serviceSlug: null, serviceName: null }],
  );

  return {
    tenant: ctx,
    scanId,
    businessName: business.name,
    serviceNames: services.map((service) => service.name),
    services,
    websiteUrl: business.websiteUrl,
    locationId: location.id,
    geo: { label: location.label, countryCode: "CA", latitude: 43.6832, longitude: -79.7629 },
    city,
    pack,
    keywords,
    keywordService,
    aiPrompts,
  };
}

/** Owner names matched to the pack by name or alias, so known services keep their benchmarks. Pack order first. */
export function resolveServices(ownerNames: readonly string[] | null, pack: VerticalPack): ScanService[] {
  const byPriority = [...pack.services].sort((a, b) => a.priority - b.priority);
  if (!ownerNames || ownerNames.length === 0) return byPriority.map(({ slug, name }) => ({ slug, name }));

  const resolved = ownerNames.map((raw) => {
    const key = raw.trim().toLowerCase();
    const known = byPriority.find(
      (service) => service.name.toLowerCase() === key || service.aliases.some((alias) => alias.toLowerCase() === key),
    );
    return known
      ? { slug: known.slug, name: known.name, priority: known.priority }
      : { slug: slugify(raw), name: raw.trim(), priority: 99 };
  });
  const unique = new Map(resolved.map((service) => [service.slug, service]));
  return [...unique.values()].sort((a, b) => a.priority - b.priority).map(({ slug, name }) => ({ slug, name }));
}
