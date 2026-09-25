import "server-only";
// Locations: switching which one is active, adding one, and the combined view across all of them.
import * as businessesRepository from "@/backend/db/repositories/businesses";
import * as locationsRepository from "@/backend/db/repositories/locations";
import * as opportunitiesRepository from "@/backend/db/repositories/opportunities";
import * as scansRepository from "@/backend/db/repositories/scans";
import * as scoresRepository from "@/backend/db/repositories/scores";
import { logger } from "@/backend/lib/logger";
import { NotFoundError } from "@/shared/errors";
import { PostalAddressSchema } from "@/shared/schemas/business";
import type { LocationOption, LocationsOverview, LocationSummary } from "@/shared/types/location";
import { SUB_SCORE_KEYS } from "@/shared/types/score";
import type { TenantContext } from "@/shared/types/tenant";
import { setSessionLocation } from "./auth/session";
import { requireManager } from "./connection-service";

const RECENT_WINDOW = 12;

export async function listOptions(ctx: TenantContext): Promise<{ options: LocationOption[]; activeId: string | null }> {
  const [all, active] = await Promise.all([locationsRepository.listAll(ctx), locationsRepository.findPrimary(ctx)]);
  return { options: all.map(({ id, label }) => ({ id, label })), activeId: active?.id ?? null };
}

export async function switchTo(ctx: TenantContext, locationId: string): Promise<void> {
  const location = await locationsRepository.findById(ctx, locationId);
  if (!location) throw new NotFoundError(`No location ${locationId} for ${ctx.organizationId}`);
  await setSessionLocation(location.id);
}

/** Adds a location and makes it active, so the next thing the owner sees is that location. */
export async function add(ctx: TenantContext, input: unknown): Promise<string> {
  requireManager(ctx);
  const address = PostalAddressSchema.parse(input);
  const business = await businessesRepository.findPrimary(ctx);
  if (!business) throw new NotFoundError(`No business for ${ctx.organizationId}`);
  const location = await locationsRepository.create(ctx, { businessId: business.id, address });
  await setSessionLocation(location.id);
  logger.info({ message: "location added", organizationId: ctx.organizationId });
  return location.id;
}

export async function getOverview(ctx: TenantContext): Promise<LocationsOverview> {
  const [all, active] = await Promise.all([locationsRepository.listAll(ctx), locationsRepository.findPrimary(ctx)]);
  const locations: LocationSummary[] = await Promise.all(
    all.map(async (location) => {
      const scoped: TenantContext = { ...ctx, locationId: location.id };
      const completed = (await scansRepository.listRecent(scoped, RECENT_WINDOW)).filter(
        (scan) => scan.status === "done",
      );
      const [latest, previous] = completed;
      const [scores, previousGrowth, opportunities] = await Promise.all([
        latest ? scoresRepository.listForScan(ctx, latest.id) : Promise.resolve([]),
        previous ? scoresRepository.findGrowthForScan(ctx, previous.id) : Promise.resolve(null),
        latest ? opportunitiesRepository.listForScan(ctx, latest.id, 1) : Promise.resolve([]),
      ]);
      const growth = scores.find((score) => score.key === "growth")?.value ?? null;
      return {
        id: location.id,
        label: location.label,
        isActive: location.id === active?.id,
        lastScanAt: latest ? (latest.finishedAt ?? latest.startedAt) : null,
        growth,
        growthDelta: growth !== null && previousGrowth ? growth - previousGrowth.value : null,
        subScores: SUB_SCORE_KEYS.flatMap((key) => {
          const found = scores.find((score) => score.key === key);
          return found ? [{ key, value: found.value }] : [];
        }),
        topOpportunity: opportunities[0]?.title ?? null,
      };
    }),
  );

  const scored = locations.filter((location) => location.growth !== null);
  return {
    locations,
    averageGrowth:
      scored.length === 0
        ? null
        : Math.round(scored.reduce((sum, location) => sum + (location.growth ?? 0), 0) / scored.length),
  };
}
