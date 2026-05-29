/**
 * Sleft Signals SDR: ICP lead scoring.
 *
 * Encodes the validated ICP: target reachable, owner-run independent practices
 * that monetize patient VOLUME (cash-pay / GLP-1 / DPC / concierge / med-spa)
 * plus referral-starved independent specialists. Practice MODEL is the single
 * heaviest signal; reachability is a near-gate; org/newness is NOT scored.
 * Hard-disqualifies hospital-employed, billing-only, and telehealth-only.
 *
 * Inputs (JSON arrays keyed by npi):
 *   /tmp/sdr_source.json    {npi, practice_name, specialty, ...}  (the DB pull)
 *   /tmp/sdr_enriched.json  {npi, website, email, contact_form_url,
 *                            contact_form_captcha, phone_verified, linkedin_url,
 *                            web_presence, decision_maker, notes}
 *
 * Output:
 *   /tmp/sdr_update.sql   BEGIN; UPDATE...; COMMIT;  (apply via Supabase MCP)
 *   stdout                ranked table + tier counts
 *
 * Run:  node scripts/score-leads.mjs
 */

import { readFileSync, writeFileSync } from "node:fs"

const SOURCE = JSON.parse(readFileSync("/tmp/sdr_source.json", "utf8"))
const ENRICHED = JSON.parse(readFileSync("/tmp/sdr_enriched.json", "utf8"))
const srcByNpi = new Map(SOURCE.map((r) => [String(r.npi), r]))

const HIGH = /primary care|cardiolog|endocrin|gastro|orthop|ob-?gyn|pulmonolog|neurolog|pain|rheumat/i
const MID = /psychiat|dermat|urolog|\bent\b|otolar|allerg|ophthal|sports/i

// Practice-model detection (the strongest ICP signal). Order = priority.
const MODELS = [
  { tag: "cash-pay/GLP-1", re: /cash[- ]?pay|self[- ]?pay|glp-?1|semaglutide|tirzepatide|weight ?loss|obesity|wegovy|ozempic/i, pts: 30 },
  { tag: "concierge/DPC", re: /concierge|direct primary care|\bdpc\b|membership|mdvip/i, pts: 28 },
  { tag: "med-spa/aesthetics", re: /med ?spa|medical spa|aesthetic|botox|filler|\btrt\b|hormone/i, pts: 26 },
  { tag: "integrative/wellness", re: /integrative|functional medicine/i, pts: 16 },
]
const INSURANCE = /accepts? (major )?insur|\bmedicare\b|\bmedicaid\b|aetna|\bbcbs\b|cigna|humana|tricare/i
const AD = /book ?online|book now|booking|scheduling widget|run(s|ning)? ads|google ads|meta ads|appointment[- ]request/i
const DQ = /lower priority|billing entity|academic hospitalist|corporate senior|hospital'?s general line|not (an )?independent|employed (academic|hospitalist|physician)|telehealth-only|exclusively telehealth/i

function detectModels(notes) {
  const hits = MODELS.filter((m) => m.re.test(notes))
  return hits
}

function scoreOne(e) {
  const src = srcByNpi.get(String(e.npi)) || {}
  const spec = src.specialty || ""
  const notes = e.notes || ""
  const dq = DQ.test(notes)
  const reasons = []
  let s = 0

  // Practice model (max 30) - the heaviest ICP signal.
  const models = detectModels(notes)
  const modelPts = models.length ? Math.max(...models.map((m) => m.pts)) : INSURANCE.test(notes) ? 8 : 6
  s += modelPts
  if (models.length) reasons.push(`model: ${models.map((m) => m.tag).join(", ")}`)
  else reasons.push("model: insurance/unknown")

  // Reachability (max 30) - near-gate; the SDR needs a scalable channel.
  let reach = 0
  if (e.email) reach += 10
  if (e.contact_form_url) reach += e.contact_form_captcha === "no" ? 12 : e.contact_form_captcha === "yes" ? 5 : 7
  if (e.phone_verified) reach += 4
  if (e.web_presence === "own_site") reach += 6
  reach = Math.min(30, reach)
  s += reach
  if (reach >= 18) reasons.push("reachable (form/email)")
  else if (reach > 0) reasons.push("partly reachable")
  else reasons.push("phone-only")

  // Ad / booking signal (max 10) - proven willingness to pay for acquisition.
  const ad = AD.test(notes)
  if (ad) { s += 10; reasons.push("runs ads / online booking") }

  // Specialty referral value (max 12).
  s += HIGH.test(spec) ? 12 : MID.test(spec) ? 8 : 5

  // Web presence (max 8).
  s += { own_site: 8, directory_only: 4, social_only: 3, none: 1 }[e.web_presence] ?? 1

  // Decision-maker known (max 5).
  if (e.decision_maker) { s += 5; reasons.push("named owner") }

  // Hard disqualifiers.
  let disq = ""
  if (dq) {
    if (/telehealth-only|exclusively telehealth/.test(notes)) disq = "telehealth-only (breaks geo)"
    else if (/billing entity|hospital'?s general line|not (an )?independent/.test(notes)) disq = "billing-only / not independent"
    else if (/academic hospitalist|employed/.test(notes)) disq = "hospital-employed"
    else disq = "lower-priority / not a clean independent target"
    s = Math.max(0, s - 30)
  }

  s = Math.max(0, Math.min(100, s))
  const tier = dq ? "D" : s >= 72 ? "A" : s >= 55 ? "B" : s >= 38 ? "C" : "D"

  let ch = "phone"
  if (e.contact_form_url && e.contact_form_captcha !== "yes") ch = "form"
  else if (e.email) ch = "email"
  else if (e.contact_form_url) ch = "form_captcha"
  else if (e.linkedin_url) ch = "linkedin"

  return {
    ...e,
    specialty: spec,
    practice_name: src.practice_name || "",
    score: s,
    tier,
    channel: ch,
    practice_model: models.map((m) => m.tag).join(", ") || (INSURANCE.test(notes) ? "insurance" : ""),
    ad_signal: ad,
    score_reasons: reasons.join("; "),
    disqualified_reason: disq,
  }
}

const scored = ENRICHED.map(scoreOne).sort((a, b) => b.score - a.score)

const esc = (v) => (v == null || v === "" ? "null" : "'" + String(v).replace(/'/g, "''") + "'")
const bool = (v) => (v ? "true" : "false")
const capSql = (e) => (e.contact_form_url ? (e.contact_form_captcha === "yes" ? "true" : e.contact_form_captcha === "no" ? "false" : "null") : "null")

const lines = ["BEGIN;"]
for (const e of scored) {
  lines.push(
    `UPDATE outreach_leads SET ` +
      `website=${esc(e.website)}, email=${esc(e.email)}, contact_form_url=${esc(e.contact_form_url)}, ` +
      `contact_form_captcha=${capSql(e)}, phone_verified=${esc(e.phone_verified)}, ` +
      `linkedin_url=${esc(e.linkedin_url)}, best_channel=${esc(e.channel)}, enrichment_notes=${esc(e.notes)}, ` +
      `practice_model=${esc(e.practice_model)}, ad_signal=${bool(e.ad_signal)}, ` +
      `score_reasons=${esc(e.score_reasons)}, disqualified_reason=${esc(e.disqualified_reason)}, ` +
      `lead_score=${e.score}, lead_tier=${esc(e.tier)}, enriched_at=now() WHERE npi=${esc(e.npi)};`
  )
}
lines.push("COMMIT;")
writeFileSync("/tmp/sdr_update.sql", lines.join("\n"))

console.log("SCORE T | MODEL                 | CHANNEL | PRACTICE")
for (const e of scored) {
  console.log(
    String(e.score).padStart(3) + "  " + e.tier + " | " + (e.practice_model || "-").padEnd(21) + " | " +
      e.channel.padEnd(7) + " | " + e.practice_name
  )
}
const t = scored.reduce((a, e) => ((a[e.tier] = (a[e.tier] || 0) + 1), a), {})
console.log(`\nTiers: A=${t.A || 0} B=${t.B || 0} C=${t.C || 0} D=${t.D || 0}`)
console.log(`Wrote ${scored.length} UPDATEs to /tmp/sdr_update.sql`)
