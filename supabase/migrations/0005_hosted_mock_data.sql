-- Forward-only migration: what the hosted simulation needs to keep between requests. Serverless instances do
-- not share memory, so anything a later request must see lives here. Plain PostgreSQL only: this must apply
-- unchanged on RDS.

-- Accounts created by sign-up while the mock identity provider is selected. A real provider keeps its own;
-- this table is empty then. Passwords are stored as salted scrypt hashes, never in plain text.
create table mock_identities (
  auth_provider_id  text primary key,
  email             text not null unique,
  password_hash     text not null,
  created_at        timestamptz not null default now()
);

-- Not a tenant table and not exposed to any client role: RLS with no policy denies every row to them.
alter table mock_identities enable row level security;

-- Competitors and AI checks are shown in the order the scan produced them.
alter table competitor_snapshots add column sort_order integer not null default 0;
alter table ai_visibility_checks add column sort_order integer not null default 0;
