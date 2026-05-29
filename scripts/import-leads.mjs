/**
 * Build an INSERT for the outreach_leads CRM from the free NPPES registry.
 *
 * Writes a single multi-row `INSERT ... ON CONFLICT (npi) DO NOTHING` to
 * /tmp/outreach-leads.sql so it can be applied via the privileged SQL path
 * (no local service-role key needed). New leads insert with status
 * 'to_contact'; existing leads are left untouched, preserving your work.
 *
 * SOURCING IS BROAD ON PURPOSE. NPPES only exposes coarse fields (name, taxonomy,
 * address, phone, dates), so this step does NOT try to identify the ICP. It pulls
 * a broad org candidate set; the real ICP gating happens downstream in the
 * enrich + score steps (see scripts/SDR.md), which require a live website and a
 * cash-pay / DPC / concierge / GLP-1 / med-spa model and reachability. We do NOT
 * sort newest-first by default: the validated ICP found that newest org NPIs skew
 * to unreachable, web-less, cash-fragile practices. Use --new only to source the
 * "newer owner-op" experiment cohort (then verify doc tenure via ao-enrich.mjs).
 *
 * Run:  node scripts/import-leads.mjs              (Tampa, broad candidate set)
 *       node scripts/import-leads.mjs Orlando 200
 *       node scripts/import-leads.mjs Tampa 150 --new   (newest-first, experiment cohort)
 */

import { writeFileSync } from "node:fs"

const args = process.argv.slice(2)
const NEW_MODE = args.includes("--new")
const positional = args.filter((a) => !a.startsWith("--"))
const CITY = positional[0] || "Tampa"
const LIMIT = Number(positional[1] || 150)
const STATE = "FL"
const PER_QUERY = 200

const SPECIALTY_QUERIES = {
  "Primary Care": ["Family Medicine", "Internal Medicine"],
  "Obesity Medicine": ["Obesity Medicine"],
  Endocrinology: ["Endocrinology"],
  Cardiology: ["Cardiovascular Disease"],
  Gastroenterology: ["Gastroenterology"],
  "OB-GYN": ["Obstetrics & Gynecology"],
  Psychiatry: ["Psychiatry"],
}

async function fetchNppes(taxonomy) {
  const params = new URLSearchParams({
    version: "2.1",
    city: CITY,
    state: STATE,
    taxonomy_description: taxonomy,
    limit: String(PER_QUERY),
  })
  try {
    const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.results || []
  } catch (e) {
    console.error(`NPPES error for "${taxonomy}":`, e.message)
    return []
  }
}

// Health-system name patterns (keep in sync with lib/affiliation.ts). We skip
// system-employed orgs because they refer inside their own system and aren't
// viable independent-referral targets for concierge outreach.
const SYSTEM_PATTERNS = [
  /adventhealth|advent health/i,
  /baycare/i,
  /\bhca\b|hca florida|hca healthcare/i,
  /tampa general|\btgh\b|tgmg/i,
  /usf health|university of south florida/i,
  /moffitt/i,
  /morton plant|mease\b/i,
  /st\.?\s*joseph'?s?\s*(hospital|health|care)/i,
  /(james a\.? haley|veterans affairs|\bv\.?a\.?\s*(medical|clinic|hospital))/i,
  /health system|healthcare system|health network/i,
  /\bhospital\b/i,
  /department of health|county health/i,
]
const isSystem = (name) => SYSTEM_PATTERNS.some((re) => re.test(name || ""))

const sqlStr = (v) => (v == null || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`)
const sqlDate = (v) => {
  if (!v) return "null"
  const t = Date.parse(v)
  return Number.isNaN(t) ? "null" : `'${new Date(t).toISOString().slice(0, 10)}'`
}

const byNpi = new Map()
for (const [specialty, queries] of Object.entries(SPECIALTY_QUERIES)) {
  for (const q of queries) {
    const results = await fetchNppes(q)
    for (const r of results) {
      const npi = String(r.number)
      if (byNpi.has(npi)) continue
      const b = r.basic || {}
      const isOrg = r.enumeration_type === "NPI-2" || !!b.organization_name
      const name = (b.organization_name || `${b.first_name || ""} ${b.last_name || ""}`).trim()
      if (!name) continue
      const addr =
        (r.addresses || []).find((a) => a.address_purpose === "LOCATION") ||
        (r.addresses || [])[0] ||
        {}
      byNpi.set(npi, {
        npi,
        practice_name: name,
        specialty,
        type: isOrg ? "Org" : "Individual",
        enumeration_date: b.enumeration_date || null,
        _ts: b.enumeration_date ? Date.parse(b.enumeration_date) || 0 : 0,
        address: addr.address_1 || null,
        city: addr.city || null,
        state: addr.state || null,
        postal_code: (addr.postal_code || "").slice(0, 5) || null,
        phone: addr.telephone_number || null,
      })
    }
  }
}

// Org practices, hospital-system names dropped. Default: broad candidate set
// (sorted by name for stable output) so the enrich+score step can find the ICP.
// --new: newest-first, only for sourcing the "newer owner-op" experiment cohort.
const rows = [...byNpi.values()]
  .filter((r) => r.type === "Org" && !isSystem(r.practice_name))
  .sort((a, b) =>
    NEW_MODE ? b._ts - a._ts : (a.practice_name || "").localeCompare(b.practice_name || "")
  )
  .slice(0, LIMIT)

const values = rows
  .map(
    (r) =>
      `(${sqlStr(r.npi)},${sqlStr(r.practice_name)},${sqlStr(r.specialty)},${sqlStr(r.type)},${sqlDate(
        r.enumeration_date
      )},${sqlStr(r.address)},${sqlStr(r.city)},${sqlStr(r.state)},${sqlStr(r.postal_code)},${sqlStr(
        r.phone
      )})`
  )
  .join(",\n")

const sql = `insert into public.outreach_leads
  (npi, practice_name, specialty, type, enumeration_date, address, city, state, postal_code, phone)
values
${values}
on conflict (npi) do nothing;`

writeFileSync("/tmp/outreach-leads.sql", sql)
console.log(`Wrote ${rows.length} ${CITY} org leads to /tmp/outreach-leads.sql`)
