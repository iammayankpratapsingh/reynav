-- Forward-only migration: core tenant tables (organizations, users, businesses, locations) in plain Postgres with RLS.
-- Plain PostgreSQL only: this must apply unchanged on RDS.

create extension if not exists "pgcrypto";

create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table users (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations (id) on delete cascade,
  -- The auth provider is an identity source only; this column is the only link to it.
  auth_provider_id  text not null unique,
  email             text not null unique,
  display_name      text not null,
  role              text not null check (role in ('owner', 'manager', 'viewer', 'system')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table businesses (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  name             text not null,
  vertical_id      text not null,
  website_url      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table locations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  business_id      uuid not null references businesses (id) on delete cascade,
  label            text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table external_connections (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  location_id      uuid not null references locations (id) on delete cascade,
  provider         text not null check (
    provider in ('website', 'local-listing', 'search-performance', 'web-analytics', 'booking-source')
  ),
  status           text not null check (
    status in ('disconnected', 'connecting', 'connected', 'needs_reconnect', 'failed')
  ),
  account_label    text,
  connected_at     timestamptz,
  last_error_code  text,
  -- Encrypted by backend/lib/encryption before it reaches this column. Never logged, never returned to the client.
  encrypted_tokens text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (organization_id, location_id, provider)
);

create table scans (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  location_id      uuid not null references locations (id) on delete cascade,
  status           text not null check (status in ('queued', 'running', 'done', 'failed')),
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table scan_steps (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  scan_id          uuid not null references scans (id) on delete cascade,
  step             text not null,
  status           text not null check (status in ('waiting', 'running', 'done', 'failed')),
  started_at       timestamptz,
  finished_at      timestamptz,
  error_code       text,
  retry_count      integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (scan_id, step)
);

-- Scores are precomputed at the end of a scan and read as-is. formula_version records which function
-- produced the number, so changing a formula never silently rewrites history.
create table scores (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  scan_id          uuid not null references scans (id) on delete cascade,
  key              text not null,
  value            integer not null check (value between 0 and 100),
  formula_version  text not null,
  created_at       timestamptz not null default now(),
  unique (scan_id, key)
);

create table opportunities (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references organizations (id) on delete cascade,
  scan_id                 uuid not null references scans (id) on delete cascade,
  rank                    integer not null,
  title                   text not null,
  note                    text not null,
  impact                  text not null check (impact in ('high', 'medium', 'low')),
  score                   integer not null check (score between 0 and 100),
  -- Estimates are stored as a range, never a single figure.
  estimated_bookings_low  integer,
  estimated_bookings_high integer,
  formula_version         text not null,
  created_at              timestamptz not null default now(),
  unique (scan_id, rank)
);

create index users_organization_id_idx on users (organization_id);
create index businesses_organization_id_idx on businesses (organization_id);
create index locations_organization_id_idx on locations (organization_id);
create index locations_business_id_idx on locations (business_id);
create index external_connections_organization_id_idx on external_connections (organization_id);
create index external_connections_location_id_idx on external_connections (location_id);
create index scans_organization_id_idx on scans (organization_id);
create index scans_location_id_idx on scans (location_id);
create index scan_steps_organization_id_idx on scan_steps (organization_id);
create index scan_steps_scan_id_idx on scan_steps (scan_id);
create index scores_organization_id_idx on scores (organization_id);
create index scores_scan_id_idx on scores (scan_id);
create index opportunities_organization_id_idx on opportunities (organization_id);
create index opportunities_scan_id_idx on opportunities (scan_id);

-- Row-level security on every tenant table. Repositories still add the organisation filter themselves;
-- this is the second line of defence, not the only one.
alter table organizations enable row level security;
alter table users enable row level security;
alter table businesses enable row level security;
alter table locations enable row level security;
alter table external_connections enable row level security;
alter table scans enable row level security;
alter table scan_steps enable row level security;
alter table scores enable row level security;
alter table opportunities enable row level security;

-- The caller's organisation is carried in a session setting so the same policies work on any Postgres host.
create policy organizations_tenant_isolation on organizations
  using (id = current_setting('app.organization_id', true)::uuid);

create policy users_tenant_isolation on users
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy businesses_tenant_isolation on businesses
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy locations_tenant_isolation on locations
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy external_connections_tenant_isolation on external_connections
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy scans_tenant_isolation on scans
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy scan_steps_tenant_isolation on scan_steps
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy scores_tenant_isolation on scores
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy opportunities_tenant_isolation on opportunities
  using (organization_id = current_setting('app.organization_id', true)::uuid);
