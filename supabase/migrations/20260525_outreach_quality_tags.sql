-- Quality tagging for outreach_leads so the board can filter out non-callable rows
-- (system-employed, corporate chains, telehealth shells, out-of-metro, dupes) without deleting them.
-- Applied via Supabase MCP on 2026-05-25; mirrored here to keep migration history in sync.

ALTER TABLE outreach_leads
  ADD COLUMN IF NOT EXISTS quality text,
  ADD COLUMN IF NOT EXISTS quality_reason text;

COMMENT ON COLUMN outreach_leads.quality IS 'good | dup | system | chain | out_of_metro | telehealth_shell';
COMMENT ON COLUMN outreach_leads.quality_reason IS 'Short human note on why this quality was assigned';

CREATE INDEX IF NOT EXISTS outreach_leads_quality_idx ON outreach_leads (quality);
