/**
 * Authorized-official enrichment for outreach_leads.
 *
 * An org NPI's enumeration date tells you when the LLC was registered with NPPES,
 * not when the doc behind it started practicing. A "2026-03 org NPI" can be a
 * fresh-grad opening their first shop OR a 20-year veteran restructuring. To tell
 * them apart we look up the authorized official (AO) of each org NPI and find
 * that doc's individual NPI — the earliest individual NPI = years-in-practice.
 *
 * Strategy:
 *   1) Pull target leads from a Postgres dump file (so we don't need a service-role key).
 *   2) For each, fetch the org NPI from NPPES, extract AO first/last/credential.
 *   3) Search NPPES for individual NPIs (NPI-1) matching name + state=FL.
 *   4) Filter to medical taxonomies (skip Dental Hygienist etc.) when credential is MD/DO/NP/PA/DDS/PhD.
 *   5) Pick earliest enumeration_date among matches → compute years practicing.
 *   6) Classify practice_age_signal: fresh (<3yr) | early (3-7) | established (8-15) | veteran (>15) | unknown.
 *   7) Write SQL UPDATE to /tmp/ao-enrich.sql.
 *
 * Run:  node scripts/ao-enrich.mjs /tmp/leads.json
 *       (leads.json is an array of {npi, practice_name, specialty} fetched via MCP)
 */

import { readFileSync, writeFileSync } from "node:fs"

const INPUT = process.argv[2] || "/tmp/ao-targets.json"
const targets = JSON.parse(readFileSync(INPUT, "utf8"))

// Medical taxonomy keywords — used to filter out same-name non-physicians (dental hygienist, chiropractor, etc.).
const MEDICAL_TAXONOMY_RE = /(internal medicine|family medicine|cardiovascular|endocrin|obesity|gastro|psychiat|obstetr|gynecol|pediatr|surg|neurolog|nephrol|pulmon|hospital medicine|infect|rheumat|allerg|dermatol|emergency|geriatr|hematol|oncol|otolar|physic|medical|ophthal|orthop|pain|sleep|sports|urolog|radiology|patholog|anesthes|primary care|preventive)/i

const MEDICAL_CREDENTIAL_RE = /(MD|DO|NP|PA|APRN|ARNP|DPM|DDS|DMD|DC)/i

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function classify(years) {
  if (years === null || years === undefined) return "unknown"
  if (years < 3) return "fresh"
  if (years < 8) return "early"
  if (years <= 15) return "established"
  return "veteran"
}

async function fetchOrgAO(npi) {
  try {
    const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`)
    if (!res.ok) return null
    const d = await res.json()
    const r = (d.results || [])[0]
    if (!r) return null
    const b = r.basic || {}
    return {
      ao_first: (b.authorized_official_first_name || "").trim(),
      ao_last: (b.authorized_official_last_name || "").trim(),
      ao_cred: (b.authorized_official_credential || "").trim(),
    }
  } catch (e) {
    return null
  }
}

async function findIndividualNpi(firstName, lastName, credential) {
  if (!firstName || !lastName) return null
  try {
    const params = new URLSearchParams({
      version: "2.1",
      first_name: firstName,
      last_name: lastName,
      state: "FL",
      enumeration_type: "NPI-1",
      limit: "20",
    })
    const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params}`)
    if (!res.ok) return null
    const d = await res.json()
    const isMedical = !credential || MEDICAL_CREDENTIAL_RE.test(credential)
    let matches = (d.results || []).filter((r) => {
      const tax = ((r.taxonomies || [{}])[0] || {}).desc || ""
      // When the AO is credentialed medical, drop non-medical taxonomies; otherwise accept any.
      return !isMedical || MEDICAL_TAXONOMY_RE.test(tax)
    })
    // Fall back to all matches if filter wiped everything (over-aggressive specialty match)
    if (matches.length === 0 && d.results?.length) matches = d.results
    if (matches.length === 0) return null
    // Earliest enumeration_date wins
    matches.sort((a, b) => Date.parse(a.basic?.enumeration_date || "9999") - Date.parse(b.basic?.enumeration_date || "9999"))
    const m = matches[0]
    return {
      npi: String(m.number),
      enum_date: m.basic?.enumeration_date || null,
      taxonomy: ((m.taxonomies || [{}])[0] || {}).desc || "",
    }
  } catch (e) {
    return null
  }
}

const sqlStr = (v) => (v == null || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`)
const sqlInt = (v) => (v == null ? "null" : String(v))
const sqlDate = (v) => {
  if (!v) return "null"
  const t = Date.parse(v)
  return Number.isNaN(t) ? "null" : `'${new Date(t).toISOString().slice(0, 10)}'`
}

const now = Date.now()
const yearsBetween = (iso) => {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return Math.floor((now - t) / (365.25 * 86400000))
}

const updates = []
let i = 0
for (const t of targets) {
  i++
  process.stderr.write(`\r[${i}/${targets.length}] ${t.practice_name?.slice(0, 50)}                                  `)
  const ao = await fetchOrgAO(t.npi)
  if (!ao || (!ao.ao_first && !ao.ao_last)) {
    updates.push({ npi: t.npi, signal: "unknown" })
    await sleep(120)
    continue
  }
  const indiv = await findIndividualNpi(ao.ao_first, ao.ao_last, ao.ao_cred)
  const years = indiv ? yearsBetween(indiv.enum_date) : null
  updates.push({
    npi: t.npi,
    ao_first: ao.ao_first,
    ao_last: ao.ao_last,
    ao_cred: ao.ao_cred,
    ao_npi: indiv?.npi || null,
    ao_npi_date: indiv?.enum_date || null,
    years,
    signal: classify(years),
  })
  await sleep(150) // be polite to NPPES
}
process.stderr.write("\n")

const sqlLines = ["BEGIN;"]
for (const u of updates) {
  sqlLines.push(
    `UPDATE outreach_leads SET ` +
      `ao_first_name=${sqlStr(u.ao_first || null)}, ` +
      `ao_last_name=${sqlStr(u.ao_last || null)}, ` +
      `ao_credential=${sqlStr(u.ao_cred || null)}, ` +
      `ao_individual_npi=${sqlStr(u.ao_npi)}, ` +
      `ao_npi_date=${sqlDate(u.ao_npi_date)}, ` +
      `ao_years_practicing=${sqlInt(u.years)}, ` +
      `practice_age_signal=${sqlStr(u.signal)}, ` +
      `ao_checked_at=now() ` +
      `WHERE npi=${sqlStr(u.npi)};`
  )
}
sqlLines.push("COMMIT;")
writeFileSync("/tmp/ao-enrich.sql", sqlLines.join("\n"))

const counts = updates.reduce((a, u) => { a[u.signal] = (a[u.signal] || 0) + 1; return a }, {})
console.log("\nAO signal distribution:")
for (const k of ["fresh", "early", "established", "veteran", "unknown"]) {
  console.log(`  ${k.padEnd(12)} ${counts[k] || 0}`)
}
console.log(`\nWrote ${updates.length} UPDATEs to /tmp/ao-enrich.sql`)
