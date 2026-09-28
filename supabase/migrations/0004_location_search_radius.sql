-- Forward-only migration: how far from each location to look for competitors, chosen by the owner in onboarding.
-- Plain PostgreSQL only: this must apply unchanged on RDS.

alter table locations
  add column search_radius_km smallint not null default 10 check (search_radius_km between 5 and 20);
