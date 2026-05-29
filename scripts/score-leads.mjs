/**
 * Sleft Signals SDR: lead scoring.
 *
 * Turns enriched outreach_leads into a ranked A/B/C/D call/contact list.
 * Deterministic, no API calls. Joins the source pull (specialty etc.) with the
 * enrichment output (website/email/form/etc.) on npi, scores each lead, and
 * emits SQL UPDATEs to apply via the Supabase MCP.
 *
 * Inputs (both JSON arrays, keyed by npi):
 *   /tmp/sdr_source.json    rows pulled from outreach_leads: {npi, practice_name, specialty, ...}
 *   /tmp/sdr_enriched.json  enrichment output: {npi, website, email, contact_form_url,
 *                           contact_form_captcha, phone_verified, linkedin_url, web_presence,
 *                           decision_maker, notes}
 *
 * Output:
 *   /tmp/sdr_update.sql      BEGIN; UPDATE...; COMMIT;  (apply via mcp__supabase__execute_sql)
 *   stdout                   ranked table + tier counts
 *
 * Run:  node scripts/score-leads.mjs
 *
 * Scoring (0-100): reachability (40) + web presence (18) + specialty referral value (20)
 *                  + decision-maker known (10) + clean-independent base (12),
 *                  with a hard penalty for billing-entity / hospital-employed / telehealth-only.
 */

import { readFileSync, writeFileSync } from "node:fs"

const SOURCE = JSON.parse(readFileSync("/tmp/sdr_source.json", "utf8"))
const ENRICHED = JSON.parse(readFileSync("/tmp/sdr_enriched.json", "utf8"))

const srcByNpi = new Map(SOURCE.map((r) => [String(r.npi), r]))

// High-volume referral specialties are worth most to a referral network.
const HIGH = /primary care|cardiolog|endocrin|gastro|orthop|ob-?gyn|pulmonolog|neurolog|pain|rheumat/i
const MID = /psychiat|dermat|urolog|\bent\b|otolar|allerg|ophthal|sports/i
// Signals that a lead is NOT a clean independent storefront and should be demoted.
const DQ = /lower priority|billing entity|academic hospitalist|corporate senior|hospital'?s general line|not (an )?independent|employed (academic|hospitalist|physician)|telehealth-only|exclusively telehealth/i

function scoreOne(e) {
  const src = srcByNpi.get(String(e.npi)) || {}
  const spec = src.specialty || ""
  const dq = DQ.test(e.notes || "")
  let s = 0

  // Reachability (max 40): can the SDR actually contact them, ideally automatably?
  let reach = 0
  if (e.email) reach += 12
  if (e.contact_form_url) reach += e.contact_form_captcha === "no" ? 14 : e.contact_form_captcha === "yes" ? 6 : 8
  if (e.phone_verified) reach += 6
  if (e.web_presence === "own_site") reach += 8
  s += Math.min(40, reach)

  // Web presence (max 18): own site signals an established, serious practice.
  s += { own_site: 18, directory_only: 9, social_only: 6, none: 2 }[e.web_presence] ?? 2

  // Specialty referral value (max 20).
  s += HIGH.test(spec) ? 20 : MID.test(spec) ? 13 : 9

  // Personalization (max 10): a named decision-maker makes outreach land.
  if (e.decision_maker) s += 10

  // Clean-independent base (max 12), zeroed + penalized when disqualified.
  s += dq ? -18 : 12

  s = Math.max(0, Math.min(100, s))
  const tier = dq ? "D" : s >= 72 ? "A" : s >= 55 ? "B" : s >= 38 ? "C" : "D"

  // Best automatable channel first; phone is the always-available fallback.
  let ch = "phone"
  if (e.contact_form_url && e.contact_form_captcha !== "yes") ch = "form"
  else if (e.email) ch = "email"
  else if (e.contact_form_url) ch = "form_captcha"
  else if (e.linkedin_url) ch = "linkedin"

  return { ...e, specialty: spec, practice_name: src.practice_name || "", score: s, tier, channel: ch }
}

const scored = ENRICHED.map(scoreOne).sort((a, b) => b.score - a.score)

const esc = (v) => (v == null || v === "" ? "null" : "'" + String(v).replace(/'/g, "''") + "'")
const capSql = (e) => (e.contact_form_url ? (e.contact_form_captcha === "yes" ? "true" : e.contact_form_captcha === "no" ? "false" : "null") : "null")

const lines = ["BEGIN;"]
for (const e of scored) {
  lines.push(
    `UPDATE outreach_leads SET ` +
      `website=${esc(e.website)}, email=${esc(e.email)}, contact_form_url=${esc(e.contact_form_url)}, ` +
      `contact_form_captcha=${capSql(e)}, phone_verified=${esc(e.phone_verified)}, ` +
      `linkedin_url=${esc(e.linkedin_url)}, best_channel=${esc(e.channel)}, ` +
      `enrichment_notes=${esc(e.notes)}, lead_score=${e.score}, lead_tier=${esc(e.tier)}, ` +
      `enriched_at=now() WHERE npi=${esc(e.npi)};`
  )
}
lines.push("COMMIT;")
writeFileSync("/tmp/sdr_update.sql", lines.join("\n"))

console.log("SCORE T | SPECIALTY        | CHANNEL      | PRACTICE")
for (const e of scored) {
  console.log(
    String(e.score).padStart(3) + "  " + e.tier + " | " + (e.specialty || "").padEnd(15) + " | " +
      e.channel.padEnd(11) + " | " + e.practice_name
  )
}
const t = scored.reduce((a, e) => ((a[e.tier] = (a[e.tier] || 0) + 1), a), {})
console.log(`\nTiers: A=${t.A || 0} B=${t.B || 0} C=${t.C || 0} D=${t.D || 0}`)
console.log(`Wrote ${scored.length} UPDATEs to /tmp/sdr_update.sql`)
