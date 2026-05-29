# Sleft Signals SDR Pipeline

## ICP (validated 2026-05-29, 5-lens analysis)
Target **reachable, owner-run independent practices that monetize patient VOLUME**: cash-pay
GLP-1/weight-loss, DPC/concierge PCPs, physician-owned med spas, plus referral-starved
independent endo/GI/OB-GYN and multi-location therapy/psych groups. Live website + reachable
channel required; owning-doc tenure >=3yr; 1-5 providers; <=25mi Tampa. **Do NOT target by
"newest" - new org NPIs skew unreachable, web-less, and cash-fragile.** Exclude hospital-employed,
billing-only LLCs, telehealth-only. Practice MODEL is the strongest signal, not age.

Turns raw NPPES practices into a ranked, contactable outreach list. Four modules:

```
SOURCE  ->  ENRICH  ->  SCORE  ->  OUTREACH
(have)      (build)     (build)     (decide)
```

## 1. SOURCE (already built)
`scripts/import-leads.mjs` / `app/api/network/discover/route.ts` pull independent practices
from the free NPPES NPI registry, geocode them, and strip out hospital-system-employed docs.
Output lands in the `outreach_leads` table. `scripts/ao-enrich.mjs` adds practice-age signal.

## 2. ENRICH (find contact channels)
For each lead, find: website, email, contact-form URL (+ whether it is captcha-walled),
verified phone, LinkedIn, decision-maker name, and a one-line characterization.

Run as a Claude Code workflow (parallel agents using web search + fetch; no API keys, no
Places billing): `scripts/sdr/enrich.workflow.js`. Each agent enriches a batch of ~3 leads
and returns structured JSON validated against a schema. Dump the result to
`/tmp/sdr_enriched.json`.

Enrichment columns on `outreach_leads` (migration `outreach_leads_sdr_enrichment`):
`website, email, contact_form_url, contact_form_captcha, phone_verified, linkedin_url,
best_channel, enrichment_notes, lead_score, lead_tier, enriched_at`.

## 3. SCORE (rank by quality + reachability)
`node scripts/score-leads.mjs` reads `/tmp/sdr_source.json` (the DB pull, for specialty) and
`/tmp/sdr_enriched.json` (enrichment output), joins on `npi`, scores 0-100, and writes
`/tmp/sdr_update.sql`.

Scoring (ICP-weighted): practice model (30, heaviest: cash-pay/GLP-1 > concierge/DPC >
med-spa > integrative > insurance) + reachability (30) + ad/booking signal (10) + specialty
referral value (12) + web presence (8) + decision-maker known (5). Hard -30 penalty +
auto-D for billing-entity, hospital-employed, or telehealth-only. Tiers: A >= 72, B 55-71,
C 38-54, D < 38. Sets practice_model, ad_signal, score_reasons, disqualified_reason for CRM
transparency. (n.b. practice model is detected from enrichment notes; capture it explicitly
in enrich for new batches.)

`best_channel` = the best automatable contact route: form (no captcha) > email > captcha-form
> linkedin > phone (always-available fallback).

## 4. OUTREACH (work the list)
Work strictly by tier. A-tier = own site + reachable form/email today; C-tier = phone (per
`GTM/outreach-playbook.md`: warm = inbox, cold = phone). Execution aggressiveness (assisted
draft-and-send vs auto-submit forms) is a product decision; see the playbook for guardrails.

## Full loop (operator steps)
1. Pull a batch from Supabase into `/tmp/sdr_source.json`:
   `select npi, practice_name, specialty, address, city, state, phone from outreach_leads
    where (quality='good' or quality is null) and website is null
    order by enumeration_date desc limit N;`
2. Run the enrich workflow on that batch -> `/tmp/sdr_enriched.json`.
3. `node scripts/score-leads.mjs` -> `/tmp/sdr_update.sql`.
4. Apply `/tmp/sdr_update.sql` (Supabase MCP `execute_sql` or psql).
5. Work A-tier first.

Validated on 24 Tampa leads (2026-05-29): 7 A, 1 B, 10 C, 6 D. A-tier all had a live website
+ contact form; 22/24 surfaced the owner by name.
