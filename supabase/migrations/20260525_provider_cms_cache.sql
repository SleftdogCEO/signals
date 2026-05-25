-- Cache of CMS "Doctors & Clinicians" billing-group enrichment, keyed by NPI.
-- Lets discovery distinguish system-employed physicians (who refer in-system)
-- from independents using the provider's real billing group, which the NPPES
-- practice name hides. Mirrors provider_geo_cache's public-policy setup.

create table if not exists public.provider_cms_cache (
  npi text primary key,
  org_names text[] not null default '{}',
  num_org_mem int,
  checked boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.provider_cms_cache enable row level security;

create policy cms_cache_public_read on public.provider_cms_cache
  for select to public using (true);
create policy cms_cache_public_insert on public.provider_cms_cache
  for insert to public with check (true);
create policy cms_cache_public_update on public.provider_cms_cache
  for update to public using (true) with check (true);
