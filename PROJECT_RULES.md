# REYNAV — Engineering Rules

These rules apply to every file in this repository. They exist so that three things stay true for the life of the product:

1. **Any external service can be replaced** without touching business logic or UI.
2. **The platform can be moved** (Vercel → AWS, Supabase → RDS) in weeks, not months.
3. **Nothing is specific to salons.** Salons are the first vertical, not the product. A dental clinic, spa, gym or restaurant must be addable as configuration, not as a code fork.

If a rule gets in the way, raise it in review. Do not quietly work around it.

---

## 1. Architecture

### 1.1 Layers

```
app/          Routes only. Receives a request, calls a service, returns a response.
frontend/     UI only. Components, hooks, client-side state.
backend/
  services/   Business logic. Orchestrates adapters, scoring and repositories.
  scoring/    Pure functions. All numbers the product shows come from here.
  adapters/   The only code allowed to talk to an external service.
  jobs/       Background workflows. Call services, never adapters directly.
  db/         Repositories. The only code allowed to write SQL or call the DB client.
verticals/    Industry packs (salon, dental, spa…). Data and config, no logic.
shared/       Types, schemas and constants used by both frontend and backend.
```

### 1.2 Dependency direction

Dependencies only point downward. Nothing imports upward.

```
app  →  services  →  scoring
                  →  adapters
                  →  db
                  →  verticals
jobs →  services
frontend → shared   (never backend)
everything → shared
```

- `scoring/` imports nothing except `shared/`. It has no I/O.
- `adapters/` never import `services/`, `db/` or other adapters.
- `frontend/` never imports `backend/`. Client code reaches the server through API routes or Server Actions only.
- A Server Component (`page.tsx`, `layout.tsx`) may call a service directly, because it runs on the server.

### 1.3 Thin routes

A route handler or Server Action does four things and nothing else: authenticate, validate input, call one service method, return the result. If a route file passes roughly 30 lines, logic has leaked into it.

```ts
// app/api/scans/route.ts
export async function POST(req: Request) {
  const ctx = await requireTenant(req);
  const input = StartScanSchema.parse(await req.json());
  const scan = await scanService.start(ctx, input);
  return Response.json(scan, { status: 202 });
}
```

---

## 2. Adapters

This is the section that makes the product replaceable piece by piece.

### 2.1 One interface per capability, not per vendor

Adapters are named after **what they do**, not **who provides it**. The rest of the code never knows which vendor is behind an interface.

| Capability interface | Current provider | Possible replacements |
|---|---|---|
| `SearchDemandProvider` | DataForSEO | SerpApi, Serper, Semrush |
| `RankTracker` | DataForSEO | SerpApi, Serper |
| `AiVisibilityProvider` | DataForSEO LLM Mentions | Semrush AI, own checker |
| `CompetitorDirectory` | DataForSEO Maps / Google Places | Yelp, Foursquare |
| `WebCrawler` | Firecrawl | Apify, ScrapingBee, self-hosted |
| `LanguageModel` | OpenAI | Azure OpenAI, Anthropic, Bedrock, Gemini |
| `SearchPerformanceSource` | Google Search Console | Bing Webmaster Tools |
| `WebAnalyticsSource` | Google Analytics 4 | Plausible, Matomo |
| `LocalListingSource` | Google Business Profile | Apple Business Connect, Bing Places |
| `BookingSource` | Square, CSV | Fresha, Vagaro, Mindbody, Jane |
| `JobRunner` | Inngest | Trigger.dev, AWS Step Functions |
| `EmailSender` | Resend | SES, Postmark |

### 2.2 Folder shape

```
backend/adapters/search-demand/
  types.ts          The interface and its domain types
  dataforseo.ts     Implementation for DataForSEO
  serpapi.ts        (future) another implementation
  mock.ts           Deterministic fake for demos and tests
  index.ts          Factory: picks the implementation from config
```

### 2.3 The interface speaks our language, never the vendor's

```ts
// backend/adapters/search-demand/types.ts
export interface SearchDemandProvider {
  getMonthlyVolume(input: {
    keywords: string[];
    location: GeoTarget;
    language: string;
  }): Promise<KeywordVolume[]>;
}

export type KeywordVolume = {
  keyword: string;
  monthlySearches: number | null;   // null = provider had no data
  source: string;                   // "dataforseo", "serpapi"… for audit only
  fetchedAt: Date;
};
```

- Vendor response types stay **inside** the implementation file. They are never exported.
- Every implementation maps the vendor response to our domain type before returning.
- If a vendor adds a field we want, add it to the domain type with a sensible default for the others.

### 2.4 Selecting an implementation

```ts
// backend/adapters/search-demand/index.ts
export function getSearchDemandProvider(): SearchDemandProvider {
  if (config.useMockData) return new MockSearchDemand();
  switch (config.providers.searchDemand) {
    case "dataforseo": return new DataForSeoSearchDemand(config.dataforseo);
    default: throw new ConfigError("Unknown searchDemand provider");
  }
}
```

Switching provider is an environment variable change plus a new implementation file. Nothing else in the codebase changes.

### 2.5 Every adapter must

- **Normalise errors** into our own error types: `RateLimitedError`, `AuthExpiredError`, `NotFoundError`, `ProviderUnavailableError`, `QuotaExhaustedError`. Callers never catch a vendor-specific error.
- **Respect rate limits** declared in one place (`config/limits.ts`), enforced by the job runner's throttle.
- **Record cost and usage** per organisation for every paid call: provider, operation, units, estimated cost, `organization_id`. This powers per-customer unit economics.
- **Have a mock** that returns realistic, deterministic data. The mock is a first-class implementation, not a test helper.
- **Have a contract test** that runs the same assertions against the mock and, when credentials are present, the real provider.
- **Time out.** No external call may wait indefinitely.

### 2.6 Adapters never

- Read from or write to the database.
- Know about organisations, tenants or verticals beyond the parameters they are passed.
- Contain business rules ("if rank > 10 then…"). That belongs in `scoring/` or `services/`.

---

## 3. Vertical-agnostic design

The core product must never contain the word "salon", a salon service name, or a salon-specific rule.

### 3.1 Generic vocabulary in code and database

| Do not use | Use instead |
|---|---|
| `salon`, `salonId` | `business`, `businessId` |
| `stylist` | `staffMember` |
| `haircut`, `balayage` as identifiers | `service` with a `slug` |
| `appointment` in core logic | `booking` |
| `client` for the end customer | `customer` |

Display labels can still say "Stylist" or "Salon". That text comes from the vertical pack (3.3), not from code.

### 3.2 A vertical is data

```
verticals/
  salon/
    manifest.ts           id, display name, labels ("staff" → "Stylist")
    services.ts           service taxonomy: slugs, names, aliases, typical price range
    segments.ts           customer segments: women, brides, professionals…
    keywords.ts           keyword templates: "{service} {city}", "{service} near me"
    benchmarks.ts         booking conversion rates, average values by service
    prompts/              AI prompt fragments for this vertical
    content-types.ts      (MVP 2) page and post types this vertical uses
  dental/
    …same files…
  _template/
    …empty pack to copy when adding a vertical…
```

Every vertical pack exports the same `VerticalPack` type from `shared/types/vertical.ts`. The type checker enforces that a new vertical is complete.

### 3.3 How the core uses a vertical

- A `business` row has a `vertical_id`.
- Services load the pack with `getVertical(business.verticalId)` and pass the relevant parts to scoring and adapters.
- Scoring functions take benchmarks as **parameters**. They never import a vertical directly.
- UI labels come from `useVerticalLabels()`, never from hardcoded strings.
- AI prompts are assembled from a vertical-agnostic base prompt plus the vertical's fragments.

```ts
// correct: benchmark is passed in
estimateMissedBookings({ volume, currentRank, targetRank, conversionRate: benchmarks.conversion[service.slug] })

// wrong: salon knowledge inside scoring
if (service === "balayage") conversionRate = 0.35;
```

### 3.4 Adding a new vertical must require

1. Copy `verticals/_template/` and fill in the files.
2. Register it in `verticals/index.ts`.
3. Add a seed business for it in `supabase/seed.sql`.

If adding a vertical needs a change anywhere else, that is a bug in the core. Fix the core, not the vertical.

---

## 4. Multi-tenancy

- Every tenant-owned table has `organization_id`. No exceptions.
- Location-level data also has `location_id`. A business with one location still has one `locations` row.
- Row-level security is enabled on every tenant table. Policies filter by the caller's organisation.
- Repositories take a `TenantContext` as their first argument and add the organisation filter themselves. Never rely on RLS alone; defence in depth.
- Background jobs carry `organizationId` in their event payload and create a `TenantContext` from it.
- Never query across organisations except in explicitly named admin repositories.

```ts
export type TenantContext = {
  organizationId: string;
  userId: string | null;   // null for background jobs
  role: "owner" | "manager" | "viewer" | "system";
};
```

---

## 5. Database

- **Plain PostgreSQL.** No Supabase-specific SQL features unless wrapped behind a repository and documented. The migration target is standard Postgres (RDS).
- **Migrations are SQL files** in `supabase/migrations/`, numbered, forward-only, reviewed like code. Never edit a merged migration.
- **Naming:** `snake_case` tables and columns, plural table names, `id uuid primary key`, `created_at` and `updated_at` on every table.
- **Foreign keys and indexes** on every `organization_id`, `location_id` and any column used in a `where` clause.
- **No business logic in the database** (no triggers that compute scores). Logic lives in `backend/`.
- **Retention:** raw time-series data (rankings, daily metrics) is kept 90 days, then rolled up into weekly summaries by a scheduled job. Design every time-series table with this in mind.
- **Precompute:** scores and opportunities are calculated at the end of a scan and stored. Dashboards read stored results; they never compute on request.

---

## 6. Authentication and identity

- Our own `users` table is the source of truth for identity, roles and organisation membership.
- The auth provider (Supabase Auth today) is an identity source only, linked by `auth_provider_id`. This keeps a later move to Cognito or another provider to a data migration, not a rewrite.
- OAuth tokens for external services (Google, Square) are stored **encrypted** in `external_connections`, never in plain text, never in logs.
- Store refresh tokens, not just access tokens, and handle `AuthExpiredError` by marking the connection as needing reconnection and notifying the owner.

---

## 7. Platform portability

- **No platform-specific features:** no Vercel Cron, Vercel KV, Edge Config, Vercel Blob or Supabase Edge Functions. Use the job runner, Postgres and the storage adapter instead.
- **All configuration through environment variables**, read in one place (`backend/config.ts`), validated at startup with a schema. The app refuses to start with missing or invalid config.
- `.env.example` lists every variable with a comment. Real values are never committed.
- **Node.js runtime** for all routes that touch the backend. Do not use the Edge runtime for anything beyond `middleware.ts`.
- File uploads (booking CSVs, images) go through a `FileStorage` adapter, not directly to a provider's SDK.
- The app must build and run with `npm run build && npm start` on any Node host. This is checked in CI.

---

## 8. Scoring

- Every number shown to a customer — Growth Score, sub-scores, missed bookings, revenue estimates, opportunity scores — comes from a pure function in `backend/scoring/`.
- **AI never calculates a number** that is shown as a metric. AI writes explanations and recommendations around numbers that scoring produced.
- Scoring functions are pure: same input, same output, no I/O, no dates from the system clock (pass `now` in).
- Every scoring function has unit tests covering normal cases, zero and missing data, and extreme values.
- Formulas are **versioned** (`growthScore.v1`, `v2`). Stored results record the version that produced them, so a formula change never silently rewrites history.
- Estimates are always returned as **ranges** (`{ low, high }`), never single figures, and the UI labels them as estimates.
- Benchmarks and weights are parameters with vertical-specific defaults, never constants inside the formula.

---

## 9. AI

- All model calls go through the `LanguageModel` adapter. No direct vendor SDK usage outside it.
- **Prompts are files**, not inline strings: `backend/ai/prompts/*.ts`, composed with vertical fragments. Prompt changes are reviewed like code.
- **Structured output only** where the result is used by code: request JSON and validate it with a zod schema. On validation failure, retry once, then fail loudly.
- **Choose the model by task tier**, not by name: `tier: "fast" | "standard"`. The adapter maps tiers to current models. When a cheaper capable model appears, change the mapping, not the call sites.
- Use batch processing for anything that does not need an immediate response.
- Keep the fixed part of every prompt first so provider prompt caching applies.
- Never send tokens, credentials or unnecessary personal data to a model. Send the minimum the task needs.

---

## 10. Background jobs

- Every long or multi-step operation (scans, syncs, report generation) is a job, not a request.
- Each step is **idempotent**: running it twice produces the same result. Retries must be safe.
- Steps **return small values** (IDs, counts, status). Large data is written to the database and referenced by ID. This keeps job-runner storage small and keeps customer data in our Canadian database.
- Every step updates `scan_steps` status (`waiting`, `running`, `done`, `failed`) so the UI can show progress.
- Throttle per provider using the limits in `config/limits.ts`. Never assume a batch of tenants can run all at once.
- Two priority levels: **interactive** (onboarding scans, a user is waiting) and **scheduled** (weekly and nightly work, spread across the night).
- A failed step records a normalised error and a retry count. After the final retry the job fails visibly, never silently.

---

## 11. Frontend

- Server Components by default. Add `"use client"` only for interactivity.
- Client components get data through API routes or Server Actions, via `frontend/lib/api-client.ts`. Never call an external vendor from the browser.
- Every screen handles four states: loading, empty, error and populated. An unhandled state is a bug.
- No hardcoded business-specific copy. Labels come from the vertical pack; product copy comes from one copy file per screen.
- Components receive typed props from `shared/types`. They never reshape raw API responses.
- Accessibility: status is never shown by colour alone; interactive elements are keyboard reachable; images have alt text.

---

## 12. Security

- Every file in `backend/` starts with `import "server-only";`.
- Secrets are read only in `backend/config.ts`. Never pass a secret to the client, never log it.
- Validate every input at the boundary (routes, Server Actions, job payloads, CSV uploads) with zod.
- Never log personal data, tokens or full vendor responses. Log IDs and summaries.
- Uploaded files are size-limited, type-checked and parsed server-side.
- Dependencies are kept updated; a failing security audit blocks merge.

---

## 13. Errors and logging

- Use our own error classes. Throw early, catch at the boundary (route, Server Action, job step).
- Routes map errors to status codes in one shared helper. Users see a plain-language message; details go to logs.
- Log in structured form: `{ level, message, organizationId, scanId, provider, durationMs }`.
- Every production error reaches Sentry with the organisation and request context attached, and personal data stripped.

---

## 14. TypeScript and code style

- `strict: true`. No `any`. Use `unknown` and narrow it.
- Domain types live in `shared/types/`. One source of truth per concept.
- Parse, do not assume: data from the network, the database JSON columns or a file is parsed with a schema before use.
- Names describe purpose: `estimateMissedBookings`, not `calc2`. Booleans read as questions: `isConnected`, `hasBookingData`.
- Small files and small functions. If a function needs a comment to explain what it does, split it or rename it.
- Formatting and linting run in CI and on commit. Style is not debated in review.

---

## 15. Testing

| Layer | What to test | Required |
|---|---|---|
| `scoring/` | Every function, including edge cases | Yes, always |
| `adapters/` | Contract tests against mock; real provider when credentials exist | Yes |
| `services/` | Main flows with mock adapters | Yes for core flows |
| `verticals/` | Each pack satisfies `VerticalPack` and loads without error | Yes |
| API routes | Auth, validation, tenant isolation | Yes for every route |
| UI | Critical paths: onboarding, scan, dashboard | End-to-end smoke tests |

A tenant isolation test exists for every repository: organisation A must never read organisation B's data.

---

## 16. Git and review

- `main` is always deployable. Work happens on short-lived branches with pull requests.
- Every pull request gets a preview deployment and at least one review.
- CI must pass: type check, lint, tests, and a production build.
- Commit messages say what changed and why.
- A pull request that adds a vendor call outside an adapter, salon-specific logic in the core, or a query without tenant filtering is not merged.

---

## 17. Checklists

### Adding a new provider for an existing capability

1. Create `backend/adapters/<capability>/<provider>.ts` implementing the interface.
2. Map every vendor response and error to domain types.
3. Add usage and cost recording.
4. Add its rate limits to `config/limits.ts`.
5. Add its config variables to `backend/config.ts` and `.env.example`.
6. Register it in the adapter's `index.ts`.
7. Run the contract tests against it.

No file outside the adapter folder and config should change.

### Adding a new capability

1. Define the interface and domain types in `types.ts`, named after what it does.
2. Write the mock first. Build the feature against the mock.
3. Write the first real implementation.
4. Call it from a service, never from a route or component.

### Adding a new vertical

1. Copy `verticals/_template/`.
2. Fill in services, segments, keywords, benchmarks, labels and prompt fragments.
3. Register it in `verticals/index.ts`.
4. Add a seed business.
5. Run the vertical tests.

If anything outside `verticals/` needs to change, fix the core instead.

### Before migrating a platform

1. Confirm no platform-specific features are in use (section 7).
2. Confirm `npm run build && npm start` works on a plain Node host.
3. Export the database with standard `pg_dump`; apply migrations on the target.
4. Move secrets to the new platform's secret store.
5. Repoint the auth identity source and migrate `auth_provider_id` values.

---

## 18. Never

- Call an external API from anywhere except `backend/adapters/`.
- Import a vendor SDK outside its adapter.
- Put a salon (or any industry) term, service or rule in core code.
- Let AI produce a number shown as a metric.
- Write a database query without an organisation filter.
- Return large payloads from a job step.
- Commit a secret, or log one.
- Use a platform-only feature that would block moving to another host.
- Show an estimate as a single promised figure.
