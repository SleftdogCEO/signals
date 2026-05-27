-- LLC formation date capture so the outreach board can sort/filter by true practice-entity age,
-- not the (often misleading) NPPES enumeration date.
-- Populated manually during call prep via inline date input + the per-card Sunbiz verify link.
-- Applied via Supabase MCP on 2026-05-26; mirrored here to keep migration history in sync.

ALTER TABLE outreach_leads
  ADD COLUMN IF NOT EXISTS llc_formation_date date,
  ADD COLUMN IF NOT EXISTS llc_checked_at timestamptz;

COMMENT ON COLUMN outreach_leads.llc_formation_date IS 'FL Sunbiz LLC/PA formation date — true practice-entity age (manual capture during call prep)';
COMMENT ON COLUMN outreach_leads.llc_checked_at IS 'When the LLC date was last verified against Sunbiz';

CREATE INDEX IF NOT EXISTS outreach_leads_llc_formation_idx ON outreach_leads (llc_formation_date);
