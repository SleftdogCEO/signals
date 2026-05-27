/**
 * Newness-first NPPES pull for the outreach board.
 *
 * The original `import-leads.mjs` pulled `city=Tampa` with no date filter, then
 * post-sorted by NPI date and capped at 150 rows. Net result: only 14 of the
 * imported leads turned out to be NPI <18mo (the ICP). This script fixes that
 * by:
 *   - Sweeping the full metro via 3-digit ZIP wildcards (336*, 337*) with
 *     pagination (NPPES caps at 200/page, 1200/query).
 *   - Filtering at the source by enumeration_date >= today - 18mo.
 *   - Pre-tagging quality='good' and dropping the same system/chain/telehealth
 *     noise the manual tagging pass dropped, so net-new rows show up in the
 *     Callable view immediately.
 *
 * Writes a single ON CONFLICT (npi) DO NOTHING insert to
 * /tmp/tampa-new-leads.sql; apply it via Supabase MCP/SQL editor.
 *
 * Run:  node scripts/tampa-new-leads.mjs                 (default 18mo cutoff)
 *       node scripts/tampa-new-leads.mjs 24              (24mo cutoff)
 */

import { writeFileSync } from "node:fs"

const MAX_AGE_MONTHS = Number(process.argv[2] || 18)
const PER_PAGE = 200
const MAX_PAGES = 6 // NPPES caps at 1200 total per query
const ZIP_PREFIXES = ["336", "337"] // Hillsborough + Pinellas (core Tampa Bay metro)

const SPECIALTY_QUERIES = {
  "Primary Care": ["Family Medicine", "Internal Medicine"],
  "Obesity Medicine": ["Obesity Medicine"],
  Endocrinology: ["Endocrinology"],
  Cardiology: ["Cardiovascular Disease"],
  Gastroenterology: ["Gastroenterology"],
  "OB-GYN": ["Obstetrics & Gynecology"],
  Psychiatry: ["Psychiatry"],
}

const CUTOFF_TS = Date.now() - MAX_AGE_MONTHS * 30.44 * 86400 * 1000

// --- noise filters (mirror the manual tagging pass on outreach_leads) ---

const SYSTEM_PATTERNS = [
  /adventhealth|advent health|adventist health/i,
  /florida hospital physician group/i,
  /baycare/i,
  /\bhca\b|hca florida|hca healthcare/i,
  /tampa general|\btgh\b|tgmg|tampa general medical group/i,
  /usf health|university of south florida/i,
  /moffitt/i,
  /morton plant|mease\b/i,
  /st\.?\s*joseph'?s?\s*(hospital|health|care)/i,
  /(james a\.? haley|veterans affairs|\bv\.?a\.?\s*(medical|clinic|hospital))/i,
  /health system|healthcare system|health network/i,
  /\bhospital\b/i,
  /department of health|county health/i,
]
const CHAIN_PATTERNS = [
  /pediatrix/i,
  /sgf tampa bay|shady grove fertility/i,
  /women'?s? care florida/i,
  /eleanor health/i,
  /conviva medical/i,
  /best value healthcare/i,
  /ageless men'?s? health/i,
  /aids healthcare foundation/i,
  /claremedica/i,
  /can community health/i,
  /bicycle health/i,
  /carebridge medical/i,
  /bluestone vbc/i,
  /ansible health/i,
  /alliance healthcare gpo/i,
  /associated practice management/i,
  /caringathome/i,
  /rubiconmd/i,
  /diabetes virtual clinic/i,
  /circle medical/i,
]

// Tampa Bay + bordering FL area codes; anything else on a "Tampa" address NPI
// is almost certainly a telehealth shell or an out-of-state corporate billing
// entity registered to a local addr.
const FL_AREA_CODES = new Set([
  "305","321","352","386","407","561","727","754","772","786","813","850","904","941","954","959","863","239"
])

const isSystem = (n) => SYSTEM_PATTERNS.some((re) => re.test(n || ""))
const isChain = (n) => CHAIN_PATTERNS.some((re) => re.test(n || ""))
const isTelehealthShell = (phone) => {
  if (!phone) return false
  const ac = phone.replace(/\D/g, "").slice(0, 3)
  return ac.length === 3 && !FL_AREA_CODES.has(ac)
}

// --- NPPES fetch ---

async function fetchNppes(zipPrefix, taxonomy, page) {
  const params = new URLSearchParams({
    version: "2.1",
    postal_code: `${zipPrefix}*`,
    taxonomy_description: taxonomy,
    limit: String(PER_PAGE),
    skip: String(page * PER_PAGE),
  })
  try {
    const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.results || []
  } catch (e) {
    console.error(`NPPES error for ${zipPrefix}* / ${taxonomy} page ${page}:`, e.message)
    return []
  }
}

const sqlStr = (v) => (v == null || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`)
const sqlDate = (v) => {
  if (!v) return "null"
  const t = Date.parse(v)
  return Number.isNaN(t) ? "null" : `'${new Date(t).toISOString().slice(0, 10)}'`
}

// --- pull loop ---

const byNpi = new Map()
let totalFetched = 0

for (const zip of ZIP_PREFIXES) {
  for (const [specialty, queries] of Object.entries(SPECIALTY_QUERIES)) {
    for (const q of queries) {
      for (let page = 0; page < MAX_PAGES; page++) {
        const results = await fetchNppes(zip, q, page)
        totalFetched += results.length
        for (const r of results) {
          const npi = String(r.number)
          if (byNpi.has(npi)) continue
          const b = r.basic || {}
          const enumTs = b.enumeration_date ? Date.parse(b.enumeration_date) || 0 : 0
          if (!enumTs || enumTs < CUTOFF_TS) continue
          const isOrg = r.enumeration_type === "NPI-2" || !!b.organization_name
          if (!isOrg) continue
          const name = (b.organization_name || `${b.first_name || ""} ${b.last_name || ""}`).trim()
          if (!name) continue
          const addr =
            (r.addresses || []).find((a) => a.address_purpose === "LOCATION") ||
            (r.addresses || [])[0] ||
            {}
          const phone = addr.telephone_number || null
          // Pre-drop the noise so net-new inserts are all callable
          if (isSystem(name)) continue
          if (isChain(name)) continue
          if (isTelehealthShell(phone)) continue
          byNpi.set(npi, {
            npi,
            practice_name: name,
            specialty,
            type: "Org",
            enumeration_date: b.enumeration_date || null,
            address: addr.address_1 || null,
            city: addr.city || null,
            state: addr.state || null,
            postal_code: (addr.postal_code || "").slice(0, 5) || null,
            phone,
          })
        }
        if (results.length < PER_PAGE) break
      }
    }
  }
}

const rows = [...byNpi.values()].sort((a, b) => {
  return (Date.parse(b.enumeration_date) || 0) - (Date.parse(a.enumeration_date) || 0)
})

if (rows.length === 0) {
  console.log("No net-new NPI rows match the criteria. Try a wider cutoff or more ZIP prefixes.")
  process.exit(0)
}

const values = rows
  .map(
    (r) =>
      `(${sqlStr(r.npi)},${sqlStr(r.practice_name)},${sqlStr(r.specialty)},${sqlStr(r.type)},${sqlDate(
        r.enumeration_date
      )},${sqlStr(r.address)},${sqlStr(r.city)},${sqlStr(r.state)},${sqlStr(r.postal_code)},${sqlStr(
        r.phone
      )},'good','Newness-first NPPES pull — NPI <${MAX_AGE_MONTHS}mo, Tampa Bay metro')`
  )
  .join(",\n")

const sql = `insert into public.outreach_leads
  (npi, practice_name, specialty, type, enumeration_date, address, city, state, postal_code, phone, quality, quality_reason)
values
${values}
on conflict (npi) do nothing;`

writeFileSync("/tmp/tampa-new-leads.sql", sql)

// Summary
const bySpecialty = {}
for (const r of rows) bySpecialty[r.specialty] = (bySpecialty[r.specialty] || 0) + 1
console.log(`\nFetched ${totalFetched} raw NPPES rows; ${rows.length} net-new Org practices match NPI <${MAX_AGE_MONTHS}mo + Tampa Bay metro after noise filters.\n`)
console.log("By specialty:")
for (const [s, n] of Object.entries(bySpecialty).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${s}`)
}
console.log(`\nWrote /tmp/tampa-new-leads.sql — apply via Supabase MCP or SQL editor.`)
console.log(`Existing NPIs already in outreach_leads will be skipped by ON CONFLICT.`)
