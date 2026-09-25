-- Forward-only migration: MVP 1 intelligence features — competitor snapshots, service metrics and owner
-- economics, AI visibility checks, growth plans, team invitations, weekly report settings, and opportunity detail.
-- Plain PostgreSQL only: this must apply unchanged on RDS.

create table competitor_snapshots (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  location_id      uuid not null references locations (id) on delete cascade,
  scan_id          uuid not null references scans (id) on delete cascade,
  name             text not null,
  is_self          boolean not null default false,
  profile          jsonb not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table service_metrics (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references organizations (id) on delete cascade,
  location_id           uuid not null references locations (id) on delete cascade,
  scan_id               uuid not null references scans (id) on delete cascade,
  service_slug          text not null,
  service_name          text not null,
  monthly_searches      integer,
  organic_position      integer,
  map_position          integer,
  competitors_offering  integer not null default 0,
  total_competitors     integer not null default 0,
  competitors_ahead     integer not null default 0,
  review_count          integer not null default 0,
  has_service_page      boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (scan_id, service_slug)
);

create table service_economics (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations (id) on delete cascade,
  location_id       uuid not null references locations (id) on delete cascade,
  service_slug      text not null,
  average_price     numeric(10, 2) not null check (average_price >= 0),
  duration_minutes  integer not null check (duration_minutes > 0),
  margin_percent    numeric(5, 2) not null check (margin_percent between 0 and 100),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (location_id, service_slug)
);

create table ai_visibility_checks (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  location_id      uuid not null references locations (id) on delete cascade,
  scan_id          uuid not null references scans (id) on delete cascade,
  prompt           text not null,
  service_slug     text,
  service_name     text,
  location_label   text not null,
  surface          text not null check (surface in ('google-ai-overview', 'chat-assistant')),
  was_mentioned    boolean not null,
  position         integer,
  named_count      integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table growth_plans (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  location_id      uuid not null references locations (id) on delete cascade,
  period           text not null check (period ~ '^\d{4}-\d{2}$'),
  scan_id          uuid references scans (id) on delete set null,
  starts_on        date not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (location_id, period)
);

create table growth_plan_tasks (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  plan_id          uuid not null references growth_plans (id) on delete cascade,
  week             integer not null check (week between 1 and 5),
  day              integer not null check (day between 1 and 7),
  due_on           date not null,
  service_slug     text not null,
  service_name     text not null,
  label            text not null,
  effort           text not null check (effort in ('quick', 'medium', 'project')),
  done             boolean not null default false,
  done_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table invitations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  email            text not null,
  role             text not null check (role in ('manager', 'viewer')),
  invited_by       uuid references users (id) on delete set null,
  status           text not null check (status in ('pending', 'accepted', 'revoked')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table report_settings (
  organization_id  uuid primary key references organizations (id) on delete cascade,
  weekly_enabled   boolean not null default true,
  recipients       jsonb not null default '[]'::jsonb,
  last_sent_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index competitor_snapshots_organization_id_idx on competitor_snapshots (organization_id);
create index competitor_snapshots_scan_id_idx on competitor_snapshots (scan_id);
create index service_metrics_organization_id_idx on service_metrics (organization_id);
create index service_metrics_scan_id_idx on service_metrics (scan_id);
create index service_economics_organization_id_idx on service_economics (organization_id);
create index service_economics_location_id_idx on service_economics (location_id);
create index ai_visibility_checks_organization_id_idx on ai_visibility_checks (organization_id);
create index ai_visibility_checks_scan_id_idx on ai_visibility_checks (scan_id);
create index growth_plans_organization_id_idx on growth_plans (organization_id);
create index growth_plans_location_id_idx on growth_plans (location_id);
create index growth_plan_tasks_organization_id_idx on growth_plan_tasks (organization_id);
create index growth_plan_tasks_plan_id_idx on growth_plan_tasks (plan_id);
create index invitations_organization_id_idx on invitations (organization_id);

alter table competitor_snapshots enable row level security;
alter table service_metrics enable row level security;
alter table service_economics enable row level security;
alter table ai_visibility_checks enable row level security;
alter table growth_plans enable row level security;
alter table growth_plan_tasks enable row level security;
alter table invitations enable row level security;
alter table report_settings enable row level security;

create policy competitor_snapshots_tenant_isolation on competitor_snapshots
  using (organization_id = current_setting('app.organization_id', true)::uuid);
create policy service_metrics_tenant_isolation on service_metrics
  using (organization_id = current_setting('app.organization_id', true)::uuid);
create policy service_economics_tenant_isolation on service_economics
  using (organization_id = current_setting('app.organization_id', true)::uuid);
create policy ai_visibility_checks_tenant_isolation on ai_visibility_checks
  using (organization_id = current_setting('app.organization_id', true)::uuid);
create policy growth_plans_tenant_isolation on growth_plans
  using (organization_id = current_setting('app.organization_id', true)::uuid);
create policy growth_plan_tasks_tenant_isolation on growth_plan_tasks
  using (organization_id = current_setting('app.organization_id', true)::uuid);
create policy invitations_tenant_isolation on invitations
  using (organization_id = current_setting('app.organization_id', true)::uuid);
create policy report_settings_tenant_isolation on report_settings
  using (organization_id = current_setting('app.organization_id', true)::uuid);

-- Opportunities: the detail screen's fields, stored at scan time so reading one is a lookup.
alter table opportunities
  add column estimated_revenue_low   integer,
  add column estimated_revenue_high  integer,
  add column keyword                 text,
  add column service_slug            text,
  add column monthly_searches        integer,
  add column your_position           integer,
  add column top_competitor_position integer,
  -- Actions, competitors, content plan, difficulty and location label, as the repository writes them.
  add column detail                  jsonb not null default '{}'::jsonb;
