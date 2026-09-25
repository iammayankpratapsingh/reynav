-- Seed data: one demo organization and one seed business per registered vertical.
-- Mirrored by src/backend/db/seed.ts, which seeds the in-memory store used until Postgres is provisioned.
-- The demo credential itself lives with the mock identity provider, not here.

insert into organizations (id, name)
values ('00000000-0000-4000-8000-000000000001'::uuid, 'Styloria Salon')
on conflict (id) do nothing;

insert into users (id, organization_id, auth_provider_id, email, display_name, role)
values (
  '00000000-0000-4000-8000-000000000002'::uuid,
  '00000000-0000-4000-8000-000000000001'::uuid,
  'mock-auth-user-demo',
  'demo@gmail.com',
  'Styloria',
  'owner'
)
on conflict (id) do nothing;

insert into businesses (id, organization_id, name, vertical_id, website_url)
values (
  '00000000-0000-4000-8000-000000000003'::uuid,
  '00000000-0000-4000-8000-000000000001'::uuid,
  'Styloria Salon',
  'salon',
  null
)
on conflict (id) do nothing;

insert into locations (id, organization_id, business_id, label)
values (
  '00000000-0000-4000-8000-000000000004'::uuid,
  '00000000-0000-4000-8000-000000000001'::uuid,
  '00000000-0000-4000-8000-000000000003'::uuid,
  'Brampton, ON'
)
on conflict (id) do nothing;
