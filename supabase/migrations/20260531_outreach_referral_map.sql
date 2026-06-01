-- Persist the generated Referral Map (gap + counts + lane mix) per outreach
-- lead. Powers the SDR worklist drafts that lead with the map and a future
-- one-page PDF artifact. Mirrors the migration already applied to the remote
-- project (gbodupnsbpuamgpqrzro).
alter table public.outreach_leads
  add column if not exists outreach_map jsonb;
