-- Forward-only migration: onboarding wizard data — the business profile read from the website, the location's
-- address, and imported bookings. Plain PostgreSQL only: this must apply unchanged on RDS.

alter table businesses
  add column business_type_id text,
  -- Display names as the owner confirmed them. Null until the website has been read.
  add column services         jsonb,
  add column segments         jsonb,
  add column onboarded_at     timestamptz;

alter table locations
  add column street         text,
  add column city           text,
  add column region         text,
  add column postal_code    text,
  add column address_source text check (address_source in ('listing', 'manual'));

create table booking_imports (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations (id) on delete cascade,
  location_id         uuid not null references locations (id) on delete cascade,
  file_name           text not null,
  storage_key         text not null,
  row_count           integer not null check (row_count >= 0),
  first_booking_date  date not null,
  last_booking_date   date not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table bookings (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations (id) on delete cascade,
  location_id      uuid not null references locations (id) on delete cascade,
  import_id        uuid not null references booking_imports (id) on delete cascade,
  external_ref     text not null,
  booked_on        date not null,
  booked_at_time   time,
  service_name     text not null,
  staff_member     text,
  -- Anonymous reference only. Customer names, emails and phone numbers are never stored.
  customer_ref     text,
  price            numeric(10, 2) not null check (price >= 0),
  channel          text not null check (channel in ('online', 'phone', 'walk-in')),
  status           text not null check (status in ('completed', 'cancelled', 'no-show')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index booking_imports_organization_id_idx on booking_imports (organization_id);
create index booking_imports_location_id_idx on booking_imports (location_id);
create index bookings_organization_id_idx on bookings (organization_id);
create index bookings_location_id_idx on bookings (location_id);
create index bookings_import_id_idx on bookings (import_id);
create index bookings_location_booked_on_idx on bookings (location_id, booked_on);

alter table booking_imports enable row level security;
alter table bookings enable row level security;

create policy booking_imports_tenant_isolation on booking_imports
  using (organization_id = current_setting('app.organization_id', true)::uuid);

create policy bookings_tenant_isolation on bookings
  using (organization_id = current_setting('app.organization_id', true)::uuid);
