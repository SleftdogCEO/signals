/**
 * Tampa concierge call-list builder.
 *
 * Pulls practices from the free NPPES registry (no API key) for Tampa, FL across
 * a concierge-relevant specialty set, ranks them by NEWEST enumeration date
 * (a proxy for "newly opened / building a patient base"), and writes a CSV.
 *
 * Each row includes a one-click "check ads" link for Meta Ad Library and Google
 * Ads Transparency, since who's paying to acquire patients is the strongest
 * proxy for "wants more patients" — and the exact persona Sleft converts.
 * (Meta's API can't return US commercial ads, so this is a manual one-click
 * check, not an automated flag.)
 *
 * Run:  node scripts/tampa-leads.mjs
 *       node scripts/tampa-leads.mjs "Orlando"      (override city)
 */

import { writeFileSync } from "node:fs"

const CITY = process.argv[2] || "Tampa"
const STATE = "FL"
const PER_QUERY = 200 // NPPES max per page

// Specialty -> NPPES taxonomy_description substrings to search.
// Concierge default: PCP hubs first, plus the cardiometabolic hypothesis cluster.
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

function parseDate(s) {
  if (!s) return 0
  const t = Date.parse(s)
  return Number.isNaN(t) ? 0 : t
}

function csvCell(v) {
  const s = String(v ?? "")
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
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
      const enumDate = b.enumeration_date || ""
      byNpi.set(npi, {
        npi,
        type: isOrg ? "Org" : "Individual",
        practice_name: name,
        specialty,
        enumeration_date: enumDate,
        _ts: parseDate(enumDate),
        address: addr.address_1 || "",
        city: addr.city || "",
        state: addr.state || "",
        zip: (addr.postal_code || "").slice(0, 5),
        phone: addr.telephone_number || "",
      })
    }
  }
}

// Newest first. Org practices first within the same date bucket (better proxy
// for "a practice that just opened" than an individual's NPI date).
const rows = [...byNpi.values()].sort((a, b) => {
  if (b._ts !== a._ts) return b._ts - a._ts
  if (a.type !== b.type) return a.type === "Org" ? -1 : 1
  return 0
})

const now = Date.now()
const yearsOpen = (ts) => (ts ? ((now - ts) / (365.25 * 24 * 3600 * 1000)).toFixed(1) : "")
const metaUrl = (name) =>
  `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&search_type=keyword_unordered&q=${encodeURIComponent(name)}`
const googleUrl = (name) =>
  `https://adstransparency.google.com/?region=US&query=${encodeURIComponent(name)}`

const header = [
  "rank",
  "enumeration_date",
  "years_open",
  "type",
  "practice_name",
  "specialty",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "check_meta_ads",
  "check_google_ads",
  "npi",
]
const lines = [header.join(",")]
rows.forEach((r, i) => {
  lines.push(
    [
      i + 1,
      r.enumeration_date,
      yearsOpen(r._ts),
      r.type,
      r.practice_name,
      r.specialty,
      r.address,
      r.city,
      r.state,
      r.zip,
      r.phone,
      metaUrl(r.practice_name),
      googleUrl(r.practice_name),
      r.npi,
    ]
      .map(csvCell)
      .join(",")
  )
})

const outPath = "GTM/tampa-leads.csv"
writeFileSync(outPath, lines.join("\n"))

// Console summary: newest organization practices (the strongest "newly opened").
const newestOrgs = rows.filter((r) => r.type === "Org").slice(0, 20)
console.log(`\nWrote ${rows.length} ${CITY}, ${STATE} leads to ${outPath}`)
console.log(`(${rows.filter((r) => r.type === "Org").length} organizations, ${rows.filter((r) => r.type === "Individual").length} individuals)\n`)
console.log(`Newest organization practices (top ${newestOrgs.length}):`)
for (const r of newestOrgs) {
  console.log(
    `  ${r.enumeration_date || "??"}  ${r.specialty.padEnd(16)}  ${r.practice_name}${r.phone ? "  ·  " + r.phone : ""}`
  )
}
