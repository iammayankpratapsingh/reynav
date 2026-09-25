import "server-only";
// Demo tenant for the in-memory store. Mirrors supabase/seed.sql so the same data appears once Postgres is wired.
//
// Seeding only ever inserts rows that are missing. It must never overwrite, because it runs lazily from the
// repositories and would otherwise undo whatever the signed-in user has changed.
import { db } from "./client";

const NOW = "2026-09-19T08:00:00.000Z";

export const DEMO_ORGANIZATION_ID = "org_demo";
export const DEMO_LOCATION_ID = "loc_demo";
/** A second branch, so location switching and the combined view have something to show. */
const SECOND_LOCATION_ID = "loc_demo_mississauga";
const SECOND_LOCATION_SCANS: readonly { id: string; at: string; scores: Record<string, number> }[] = [
  {
    id: "scan_miss_2026_07",
    at: "2026-07-22T08:00:00.000Z",
    scores: { visibility: 48, maps: 55, website: 47, "ai-search": 18, reviews: 71, conversion: 58, growth: 49 },
  },
  {
    id: "scan_miss_2026_08",
    at: "2026-08-22T08:00:00.000Z",
    scores: { visibility: 52, maps: 58, website: 47, "ai-search": 22, reviews: 73, conversion: 60, growth: 52 },
  },
];

/** Monthly scans before this one, oldest first, so trends and the history chart have something to show. */
const SCORE_VERSIONS: Record<string, string> = {
  visibility: "searchVisibility.v1",
  maps: "listingQuality.v1",
  website: "websiteHealth.v1",
  "ai-search": "aiVisibility.v1",
  reviews: "reviewStrength.v1",
  conversion: "conversion.v1",
  growth: "growthScore.v1",
};

const PREVIOUS_SCANS: readonly { id: string; at: string; scores: Record<string, number> }[] = [
  {
    id: "scan_2026_05",
    at: "2026-05-19T08:00:00.000Z",
    scores: { visibility: 58, maps: 61, website: 44, "ai-search": 21, reviews: 78, conversion: 55, growth: 52 },
  },
  {
    id: "scan_2026_06",
    at: "2026-06-19T08:00:00.000Z",
    scores: { visibility: 61, maps: 64, website: 43, "ai-search": 24, reviews: 80, conversion: 57, growth: 55 },
  },
  {
    id: "scan_2026_07",
    at: "2026-07-19T08:00:00.000Z",
    scores: { visibility: 63, maps: 66, website: 46, "ai-search": 27, reviews: 81, conversion: 60, growth: 57 },
  },
  {
    id: "scan_previous",
    at: "2026-08-19T08:00:00.000Z",
    scores: { visibility: 66, maps: 70, website: 47, "ai-search": 30, reviews: 84, conversion: 62, growth: 60 },
  },
];

/**
 * AI answer checks for the past scans, so AI Search has a trend to show. Named in more answers each month,
 * starting from almost nowhere — the story the demo tenant tells.
 */
const PAST_AI_PROMPTS: readonly { prompt: string; serviceSlug: string | null; serviceName: string | null }[] = [
  { prompt: "what is the best salon in brampton?", serviceSlug: null, serviceName: null },
  { prompt: "where should i go for haircut in brampton?", serviceSlug: "haircut", serviceName: "Haircut" },
  { prompt: "where should i go for balayage in brampton?", serviceSlug: "balayage", serviceName: "Balayage" },
  { prompt: "where should i go for hair colour in brampton?", serviceSlug: "hair-colour", serviceName: "Hair Colour" },
  { prompt: "recommend a highly rated salon near brampton", serviceSlug: null, serviceName: null },
];

function seedPastAiChecks(scanId: string, at: string, monthIndex: number): void {
  let index = 0;
  for (const [promptIndex, row] of PAST_AI_PROMPTS.entries()) {
    for (const [surfaceIndex, surface] of ["google-ai-overview", "chat-assistant"].entries()) {
      // One more prompt/surface pair starts naming the business each month.
      const wasMentioned = promptIndex * 2 + surfaceIndex < monthIndex + 1;
      db.aiVisibilityChecks.insert({
        id: `ai_${scanId}_${index++}`,
        organization_id: DEMO_ORGANIZATION_ID,
        location_id: DEMO_LOCATION_ID,
        scan_id: scanId,
        prompt: row.prompt,
        service_slug: row.serviceSlug,
        service_name: row.serviceName,
        location_label: "Brampton, ON",
        surface,
        was_mentioned: wasMentioned,
        position: wasMentioned ? 4 + promptIndex : null,
        named_count: 7,
        created_at: at,
      });
    }
  }
}

export function seedDemoTenant(): void {
  if (db.organizations.findById(DEMO_ORGANIZATION_ID)) return;

  db.organizations.insert({ id: DEMO_ORGANIZATION_ID, name: "Styloria Salon", created_at: NOW });

  db.users.insert({
    id: "usr_demo",
    organization_id: DEMO_ORGANIZATION_ID,
    auth_provider_id: "mock-auth-user-demo",
    email: "demo@gmail.com",
    display_name: "Styloria",
    role: "owner",
    created_at: NOW,
  });

  db.businesses.insert({
    id: "biz_demo",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Styloria Salon",
    vertical_id: "salon",
    website_url: null,
    business_type_id: null,
    services_json: null,
    segments_json: null,
    onboarded_at: null,
    created_at: NOW,
  });

  db.locations.insert({
    id: DEMO_LOCATION_ID,
    organization_id: DEMO_ORGANIZATION_ID,
    business_id: "biz_demo",
    label: "Brampton, ON",
    street: null,
    city: null,
    region: null,
    postal_code: null,
    address_source: null,
    created_at: NOW,
  });

  db.locations.insert({
    id: SECOND_LOCATION_ID,
    organization_id: DEMO_ORGANIZATION_ID,
    business_id: "biz_demo",
    label: "Mississauga, ON",
    street: "100 City Centre Dr",
    city: "Mississauga",
    region: "ON",
    postal_code: "L5B 2C9",
    address_source: "manual",
    created_at: "2026-09-19T08:00:01.000Z",
  });

  for (const scan of SECOND_LOCATION_SCANS) {
    db.scans.insert({
      id: scan.id,
      organization_id: DEMO_ORGANIZATION_ID,
      location_id: SECOND_LOCATION_ID,
      status: "done",
      started_at: scan.at,
      finished_at: scan.at,
    });
    for (const [key, value] of Object.entries(scan.scores)) {
      db.scores.insert({
        id: `score_${scan.id}_${key}`,
        organization_id: DEMO_ORGANIZATION_ID,
        scan_id: scan.id,
        key,
        value,
        formula_version: SCORE_VERSIONS[key] ?? "unknown",
        created_at: scan.at,
      });
    }
  }

  for (const [monthIndex, scan] of PREVIOUS_SCANS.entries()) {
    seedPastAiChecks(scan.id, scan.at, monthIndex);
    db.scans.insert({
      id: scan.id,
      organization_id: DEMO_ORGANIZATION_ID,
      location_id: DEMO_LOCATION_ID,
      status: "done",
      started_at: scan.at,
      finished_at: scan.at,
    });
    for (const [key, value] of Object.entries(scan.scores)) {
      db.scores.insert({
        id: `score_${scan.id}_${key}`,
        organization_id: DEMO_ORGANIZATION_ID,
        scan_id: scan.id,
        key,
        value,
        formula_version: SCORE_VERSIONS[key] ?? "unknown",
        created_at: scan.at,
      });
    }
  }
}
