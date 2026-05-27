-- Authorized-official enrichment for outreach_leads.
-- Stores the AO's individual NPI + earliest enumeration date so we can tell
-- a true new-doc practice apart from a 20-year veteran's LLC reorg.
-- Populated by scripts/ao-enrich.mjs. Applied via Supabase MCP on 2026-05-27.

ALTER TABLE outreach_leads
  ADD COLUMN IF NOT EXISTS ao_first_name text,
  ADD COLUMN IF NOT EXISTS ao_last_name text,
  ADD COLUMN IF NOT EXISTS ao_credential text,
  ADD COLUMN IF NOT EXISTS ao_individual_npi text,
  ADD COLUMN IF NOT EXISTS ao_npi_date date,
  ADD COLUMN IF NOT EXISTS ao_years_practicing integer,
  ADD COLUMN IF NOT EXISTS practice_age_signal text,
  ADD COLUMN IF NOT EXISTS ao_checked_at timestamptz;

COMMENT ON COLUMN outreach_leads.ao_years_practicing IS 'Years since AO''s earliest individual NPI (NPPES). Low = fresh doc, high = reorg.';
COMMENT ON COLUMN outreach_leads.practice_age_signal IS 'fresh (AO <3yr) | early (3-7yr) | established (8-15yr) | veteran (>15yr, likely reorg) | unknown';

CREATE INDEX IF NOT EXISTS outreach_leads_ao_years_idx ON outreach_leads (ao_years_practicing);
