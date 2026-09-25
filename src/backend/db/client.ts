import "server-only";
// The database client. Postgres is not provisioned yet, so this is an in-memory store with the same shape
// the repositories will keep once it is: rows in, rows out, every tenant row carrying organization_id.
//
// Replacing it with Postgres means rewriting this file and the bodies of backend/db/repositories/*.
// Nothing above the repository layer imports it, so nothing above the repository layer changes.
//
// It is per-process and resets when the server restarts. That is fine for a simulation and is the reason
// it is not used for anything a customer would expect to keep.

type Row = { id: string };

class Table<T extends Row> {
  private rows = new Map<string, T>();

  insert(row: T): T {
    this.rows.set(row.id, row);
    return row;
  }

  upsert(row: T): T {
    return this.insert(row);
  }

  findById(id: string): T | null {
    return this.rows.get(id) ?? null;
  }

  remove(predicate: (row: T) => boolean): void {
    for (const [id, row] of this.rows) if (predicate(row)) this.rows.delete(id);
  }

  find(predicate: (row: T) => boolean): T | null {
    for (const row of this.rows.values()) if (predicate(row)) return row;
    return null;
  }

  filter(predicate: (row: T) => boolean): T[] {
    return [...this.rows.values()].filter(predicate);
  }

  update(id: string, patch: Partial<T>): T | null {
    const existing = this.rows.get(id);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    this.rows.set(id, next);
    return next;
  }
}

export type OrganizationRow = { id: string; name: string; created_at: string };

export type UserRow = {
  id: string;
  organization_id: string;
  auth_provider_id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
};

export type BusinessRow = {
  id: string;
  organization_id: string;
  name: string;
  vertical_id: string;
  website_url: string | null;
  business_type_id: string | null;
  /** JSON arrays of display names, parsed on read. Null until the website has been read. */
  services_json: string | null;
  segments_json: string | null;
  onboarded_at: string | null;
  created_at: string;
};

export type LocationRow = {
  id: string;
  organization_id: string;
  business_id: string;
  label: string;
  street: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  address_source: string | null;
  created_at: string;
};

export type BookingRow = {
  id: string;
  organization_id: string;
  location_id: string;
  import_id: string;
  external_ref: string;
  booked_on: string;
  booked_at_time: string | null;
  service_name: string;
  staff_member: string | null;
  customer_ref: string | null;
  price: number;
  channel: string;
  status: string;
  created_at: string;
};

export type BookingImportRow = {
  id: string;
  organization_id: string;
  location_id: string;
  file_name: string;
  storage_key: string;
  row_count: number;
  first_booking_date: string;
  last_booking_date: string;
  created_at: string;
};

export type ExternalConnectionRow = {
  id: string;
  organization_id: string;
  location_id: string;
  provider: string;
  status: string;
  account_label: string | null;
  connected_at: string | null;
  last_error_code: string | null;
  /** Encrypted at rest by backend/lib/encryption. Never selected into a domain type. */
  encrypted_tokens: string | null;
  updated_at: string;
};

export type ScanRow = {
  id: string;
  organization_id: string;
  location_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
};

export type ScanStepRow = {
  id: string;
  organization_id: string;
  scan_id: string;
  step: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  error_code: string | null;
  retry_count: number;
};

export type ScoreRow = {
  id: string;
  organization_id: string;
  scan_id: string;
  /** "growth" for the headline score, or a sub-score key. */
  key: string;
  value: number;
  formula_version: string;
  created_at: string;
};

export type OpportunityRow = {
  id: string;
  organization_id: string;
  scan_id: string;
  rank: number;
  title: string;
  note: string;
  impact: string;
  score: number;
  estimated_bookings_low: number | null;
  estimated_bookings_high: number | null;
  estimated_revenue_low: number | null;
  estimated_revenue_high: number | null;
  keyword: string | null;
  service_slug: string | null;
  monthly_searches: number | null;
  your_position: number | null;
  top_competitor_position: number | null;
  /** Detail payloads the scan produced, stored as JSON and parsed on read. */
  detail_json: string;
  formula_version: string;
  created_at: string;
};

export type CompetitorSnapshotRow = {
  id: string;
  organization_id: string;
  location_id: string;
  scan_id: string;
  name: string;
  is_self: boolean;
  /** The CompetitorProfile as JSON, parsed on read. */
  profile_json: string;
  created_at: string;
};

export type ServiceMetricsRow = {
  id: string;
  organization_id: string;
  location_id: string;
  scan_id: string;
  service_slug: string;
  service_name: string;
  monthly_searches: number | null;
  organic_position: number | null;
  map_position: number | null;
  competitors_offering: number;
  total_competitors: number;
  competitors_ahead: number;
  review_count: number;
  has_service_page: boolean;
  created_at: string;
};

export type ServiceEconomicsRow = {
  id: string;
  organization_id: string;
  location_id: string;
  service_slug: string;
  average_price: number;
  duration_minutes: number;
  margin_percent: number;
  updated_at: string;
};

export type AiVisibilityCheckRow = {
  id: string;
  organization_id: string;
  location_id: string;
  scan_id: string;
  prompt: string;
  service_slug: string | null;
  service_name: string | null;
  location_label: string;
  surface: string;
  was_mentioned: boolean;
  position: number | null;
  named_count: number;
  created_at: string;
};

export type GrowthPlanRow = {
  id: string;
  organization_id: string;
  location_id: string;
  /** Calendar month the plan belongs to, "YYYY-MM". One plan per location per month. */
  period: string;
  scan_id: string;
  starts_on: string;
  created_at: string;
};

export type GrowthPlanTaskRow = {
  id: string;
  organization_id: string;
  plan_id: string;
  week: number;
  day: number;
  due_on: string;
  service_slug: string;
  service_name: string;
  label: string;
  effort: string;
  done: boolean;
  done_at: string | null;
};

export type InvitationRow = {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  invited_by: string | null;
  status: string;
  created_at: string;
};

export type ReportSettingsRow = {
  /** One row per organisation; the id is the organisation id. */
  id: string;
  organization_id: string;
  weekly_enabled: boolean;
  recipients_json: string;
  last_sent_at: string | null;
  updated_at: string;
};

export type Database = {
  organizations: Table<OrganizationRow>;
  users: Table<UserRow>;
  businesses: Table<BusinessRow>;
  locations: Table<LocationRow>;
  externalConnections: Table<ExternalConnectionRow>;
  scans: Table<ScanRow>;
  scanSteps: Table<ScanStepRow>;
  scores: Table<ScoreRow>;
  opportunities: Table<OpportunityRow>;
  bookings: Table<BookingRow>;
  bookingImports: Table<BookingImportRow>;
  competitorSnapshots: Table<CompetitorSnapshotRow>;
  serviceMetrics: Table<ServiceMetricsRow>;
  serviceEconomics: Table<ServiceEconomicsRow>;
  aiVisibilityChecks: Table<AiVisibilityCheckRow>;
  growthPlans: Table<GrowthPlanRow>;
  growthPlanTasks: Table<GrowthPlanTaskRow>;
  invitations: Table<InvitationRow>;
  reportSettings: Table<ReportSettingsRow>;
};

function createDatabase(): Database {
  return {
    organizations: new Table<OrganizationRow>(),
    users: new Table<UserRow>(),
    businesses: new Table<BusinessRow>(),
    locations: new Table<LocationRow>(),
    externalConnections: new Table<ExternalConnectionRow>(),
    scans: new Table<ScanRow>(),
    scanSteps: new Table<ScanStepRow>(),
    scores: new Table<ScoreRow>(),
    opportunities: new Table<OpportunityRow>(),
    bookings: new Table<BookingRow>(),
    bookingImports: new Table<BookingImportRow>(),
    competitorSnapshots: new Table<CompetitorSnapshotRow>(),
    serviceMetrics: new Table<ServiceMetricsRow>(),
    serviceEconomics: new Table<ServiceEconomicsRow>(),
    aiVisibilityChecks: new Table<AiVisibilityCheckRow>(),
    growthPlans: new Table<GrowthPlanRow>(),
    growthPlanTasks: new Table<GrowthPlanTaskRow>(),
    invitations: new Table<InvitationRow>(),
    reportSettings: new Table<ReportSettingsRow>(),
  };
}

// Survives hot reloads in development so a signed-in session keeps its rows.
const globalForDb = globalThis as typeof globalThis & { __reynavDb?: Database };

function resolve(): Database {
  const fresh = createDatabase();
  const cached = globalForDb.__reynavDb;
  if (!cached) {
    globalForDb.__reynavDb = fresh;
    return fresh;
  }
  // A hot reload that added a table leaves the cached object short of it; fill the gaps rather than
  // dropping everything the current session has.
  for (const key of Object.keys(fresh) as (keyof Database)[]) {
    if (!cached[key]) (cached as Record<string, unknown>)[key] = fresh[key];
  }
  return cached;
}

export const db: Database = resolve();
