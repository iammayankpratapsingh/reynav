-- Seed data: the demo tenant, with two branches and a few months of finished scans so trends, the history
-- chart and location switching have something to show. The demo credential itself lives with the mock
-- identity provider, not here.
--
-- Idempotent: every insert skips rows that already exist, so running it twice changes nothing and never
-- undoes what the signed-in demo user has changed.

insert into organizations (id, name)
values ('00000000-0000-4000-8000-000000000001', 'Styloria Salon')
on conflict (id) do nothing;

insert into users (id, organization_id, auth_provider_id, email, display_name, role)
values (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'mock-auth-user-demo',
  'demo@gmail.com',
  'Styloria',
  'owner'
)
on conflict (id) do nothing;

insert into businesses (id, organization_id, name, vertical_id)
values ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Styloria Salon', 'salon')
on conflict (id) do nothing;

insert into locations (id, organization_id, business_id, label, created_at)
values (
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000003',
  'Brampton, ON',
  '2026-09-19T08:00:00Z'
)
on conflict (id) do nothing;

-- A second branch, so location switching and the combined view have something to show.
insert into locations
  (id, organization_id, business_id, label, street, city, region, postal_code, address_source, created_at)
values (
  '00000000-0000-4000-8000-000000000005',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000003',
  'Mississauga, ON',
  '100 City Centre Dr',
  'Mississauga',
  'ON',
  'L5B 2C9',
  'manual',
  '2026-09-19T08:00:01Z'
)
on conflict (id) do nothing;

-- Monthly scans before today, oldest first. month_index drives how often AI answers name the business.
create temporary table seed_scans (
  id           uuid primary key,
  location_id  uuid not null,
  at           timestamptz not null,
  month_index  integer,
  scores       jsonb not null
) on commit drop;

insert into seed_scans (id, location_id, at, month_index, scores) values
  -- Brampton
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000004', '2026-05-19T08:00:00Z', 0,
    '{"visibility": 58, "maps": 61, "website": 44, "ai-search": 21, "reviews": 78, "conversion": 55, "growth": 52}'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000004', '2026-06-19T08:00:00Z', 1,
    '{"visibility": 61, "maps": 64, "website": 43, "ai-search": 24, "reviews": 80, "conversion": 57, "growth": 55}'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000004', '2026-07-19T08:00:00Z', 2,
    '{"visibility": 63, "maps": 66, "website": 46, "ai-search": 27, "reviews": 81, "conversion": 60, "growth": 57}'),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000004', '2026-08-19T08:00:00Z', 3,
    '{"visibility": 66, "maps": 70, "website": 47, "ai-search": 30, "reviews": 84, "conversion": 62, "growth": 60}'),
  -- Mississauga
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000005', '2026-07-22T08:00:00Z', null,
    '{"visibility": 48, "maps": 55, "website": 47, "ai-search": 18, "reviews": 71, "conversion": 58, "growth": 49}'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000005', '2026-08-22T08:00:00Z', null,
    '{"visibility": 52, "maps": 58, "website": 47, "ai-search": 22, "reviews": 73, "conversion": 60, "growth": 52}');

insert into scans (id, organization_id, location_id, status, started_at, finished_at)
select id, '00000000-0000-4000-8000-000000000001', location_id, 'done', at, at from seed_scans
on conflict (id) do nothing;

insert into scores (organization_id, scan_id, key, value, formula_version, created_at)
select
  '00000000-0000-4000-8000-000000000001',
  s.id,
  score.key,
  score.value::integer,
  case score.key
    when 'visibility' then 'searchVisibility.v1'
    when 'maps' then 'listingQuality.v1'
    when 'website' then 'websiteHealth.v1'
    when 'ai-search' then 'aiVisibility.v1'
    when 'reviews' then 'reviewStrength.v1'
    when 'conversion' then 'conversion.v1'
    when 'growth' then 'growthScore.v1'
  end,
  s.at
from seed_scans s, jsonb_each_text(s.scores) as score (key, value)
on conflict (scan_id, key) do nothing;

-- AI answer checks for the Brampton scans, so AI Search has a trend to show: named in one more
-- prompt/surface pair each month, starting from almost nowhere.
insert into ai_visibility_checks (
  organization_id, location_id, scan_id, prompt, service_slug, service_name, location_label, surface,
  was_mentioned, position, named_count, sort_order, created_at
)
select
  '00000000-0000-4000-8000-000000000001',
  s.location_id,
  s.id,
  p.prompt,
  p.service_slug,
  p.service_name,
  'Brampton, ON',
  surface.name,
  (p.prompt_index * 2 + surface.surface_index) < s.month_index + 1,
  case when (p.prompt_index * 2 + surface.surface_index) < s.month_index + 1 then 4 + p.prompt_index end,
  7,
  p.prompt_index * 2 + surface.surface_index,
  s.at
from seed_scans s
cross join (values
  (0, 'what is the best salon in brampton?', null, null),
  (1, 'where should i go for haircut in brampton?', 'haircut', 'Haircut'),
  (2, 'where should i go for balayage in brampton?', 'balayage', 'Balayage'),
  (3, 'where should i go for hair colour in brampton?', 'hair-colour', 'Hair Colour'),
  (4, 'recommend a highly rated salon near brampton', null, null)
) as p (prompt_index, prompt, service_slug, service_name)
cross join (values (0, 'google-ai-overview'), (1, 'chat-assistant')) as surface (surface_index, name)
where s.month_index is not null
  and not exists (select 1 from ai_visibility_checks existing where existing.scan_id = s.id);
