// Referral Map engine — the value-first deliverable described in
// GTM/referral-map-offer.md. Given a TARGET practice (a cold lead, not a
// registered member), it returns the named independent practices nearby that
// could send it patients (inbound) and that it should send patients to
// (outbound), plus a single "gap" — the one nearby partner the practice almost
// certainly is not connected to yet. That gap is the hook every outreach
// message now leads with.
//
// This mirrors the live partner engine in app/api/network/discover/route.ts
// (NPPES sweep -> free Census geocode -> haversine radius -> CMS billing-group
// independent filter), but is keyed off a lead's specialty + address instead of
// a logged-in provider profile. The discover route is intentionally left
// untouched; the low-level fetch helpers are duplicated here so this module can
// evolve for cold-lead mapping without risking the member-facing path.

import { createClient } from "@supabase/supabase-js"
import { classifyAffiliation, classifySystemFromOrgs } from "@/lib/affiliation"
import { ADJACENCY_MAP } from "@/lib/adjacency-map"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------------------------------------------------------------------------
// Specialty taxonomy + intake language (kept in sync with discover/route.ts)
// ---------------------------------------------------------------------------

const SPECIALTY_TAXONOMY_QUERY: Record<string, string[]> = {
  "Primary Care": ["Family Medicine", "Internal Medicine"],
  "Cardiology": ["Cardiovascular Disease"],
  "Pulmonology": ["Pulmonary Disease"],
  "Endocrinology": ["Endocrinology"],
  "Gastroenterology": ["Gastroenterology"],
  "Rheumatology": ["Rheumatology"],
  "Neurology": ["Neurology"],
  "Psychiatry": ["Psychiatry"],
  "Pain Management": ["Pain Medicine"],
  "Orthopedic Surgery": ["Orthopaedic Surgery"],
  "Plastic Surgery": ["Plastic Surgery"],
  "Urology": ["Urology"],
  "Sports Medicine": ["Sports Medicine"],
  "Pediatrics": ["Pediatrics"],
  "OB-GYN": ["Obstetrics & Gynecology"],
  "Dermatology": ["Dermatology"],
  "Ophthalmology": ["Ophthalmology"],
  "ENT (Otolaryngology)": ["Otolaryngology"],
  "Allergy & Immunology": ["Allergy & Immunology"],
}

// What each specialty TAKES IN — used to phrase why a partner refers.
const RECEIVES: Record<string, string> = {
  "Primary Care": "patients needing a primary-care home and chronic-disease management",
  "Obesity Medicine": "overweight, obese, and metabolic-syndrome patients for medical weight management",
  "Cardiology": "patients with hypertension, arrhythmia, or chest pain",
  "Pulmonology": "patients with chronic cough, COPD, or suspected sleep apnea",
  "Endocrinology": "patients with complex diabetes, thyroid, or metabolic disorders",
  "Gastroenterology": "patients with GI symptoms, IBD, or due for a colonoscopy",
  "Rheumatology": "patients with autoimmune or inflammatory-arthritis symptoms",
  "Neurology": "patients with headache, seizures, or neuropathy",
  "Psychiatry": "patients needing depression, anxiety, or medication management",
  "Dermatology": "patients with suspicious lesions, chronic rashes, or skin-cancer screening needs",
  "Ophthalmology": "patients needing diabetic eye exams or vision-loss evaluation",
  "Orthopedic Surgery": "patients with fractures, joint pain, or surgical MSK needs",
  "Pain Management": "patients with chronic or post-surgical pain",
  "Pediatrics": "pediatric patients and the children of your patients",
  "ENT (Otolaryngology)": "patients with sinus, hearing, or throat complaints",
  "Allergy & Immunology": "patients with allergies, asthma, or immune workups",
  "Urology": "patients with urologic or men's-health concerns",
  "OB-GYN": "women needing prenatal, gynecologic, or PCOS care",
  "Sports Medicine": "patients with sports injuries or MSK overuse",
  "Plastic Surgery": "patients needing reconstructive or cosmetic surgical evaluation",
  "Registered Dietitian": "patients needing medical nutrition therapy",
}

// Short "what this specialty is" phrase, for the one-line gap sentence.
const SHORT_NEED: Record<string, string> = {
  "Primary Care": "a primary-care home",
  "Obesity Medicine": "medical weight management",
  "Cardiology": "a cardiologist",
  "Pulmonology": "a pulmonologist",
  "Endocrinology": "an endocrinologist",
  "Gastroenterology": "a gastroenterologist",
  "Rheumatology": "a rheumatologist",
  "Neurology": "a neurologist",
  "Psychiatry": "a psychiatrist",
  "Dermatology": "a dermatologist",
  "Ophthalmology": "an eye specialist",
  "Orthopedic Surgery": "an orthopedic surgeon",
  "Pain Management": "pain management",
  "Pediatrics": "a pediatrician",
  "ENT (Otolaryngology)": "an ENT",
  "Allergy & Immunology": "an allergist",
  "Urology": "a urologist",
  "OB-GYN": "an OB-GYN",
  "Sports Medicine": "a sports-medicine doctor",
  "Plastic Surgery": "a plastic surgeon",
  "Registered Dietitian": "a dietitian",
}

function intakePhrase(specialty: string): string {
  return RECEIVES[specialty] || `patients who need ${specialty.toLowerCase()} care`
}

// Natural-language proximity clause ending in "from you". Avoids the awkward
// "0 miles" / "0.1 miles" that raw rounding produces when a partner geocodes to
// the same block as the target.
function proximityPhrase(d: number | null): string {
  if (d == null) return "a short drive from you"
  if (d < 0.6) return "just up the road from you"
  if (d < 1.5) return "about a mile from you"
  return `about ${Math.round(d)} miles from you`
}

// "Primary Care" -> "a primary care practice"; "Endocrinology" -> "an
// endocrinology practice". Used in the gap sentence.
function practicePhrase(specialty: string): string {
  const lower = specialty.toLowerCase().replace(/\s*\(otolaryngology\)/, "")
  const article = /^[aeiou]/.test(lower) ? "an" : "a"
  return `${article} ${lower} practice`
}

function canonicalizeSpecialty(raw: string): string {
  const s = (raw || "").toLowerCase()
  if (s.includes("obesity") || s.includes("weight")) return "Obesity Medicine"
  if (s.includes("dietit") || s.includes("nutrition")) return "Registered Dietitian"
  if (s.includes("primary") || s.includes("family") || s.includes("internal medicine") || s.includes("general practice")) return "Primary Care"
  if (s.includes("cardio")) return "Cardiology"
  if (s.includes("pulmonolog")) return "Pulmonology"
  if (s.includes("endocrinolog")) return "Endocrinology"
  if (s.includes("gastroenterolog")) return "Gastroenterology"
  if (s.includes("rheumatolog")) return "Rheumatology"
  if (s.includes("neurolog")) return "Neurology"
  if (s.includes("psychiatr")) return "Psychiatry"
  if (s.includes("pain")) return "Pain Management"
  if (s.includes("orthop")) return "Orthopedic Surgery"
  if (s.includes("plastic")) return "Plastic Surgery"
  if (s.includes("urolog")) return "Urology"
  if (s.includes("sports medicine")) return "Sports Medicine"
  if (s.includes("pediatric")) return "Pediatrics"
  if (s.includes("obstetric") || s.includes("gynecolog") || s.includes("ob-gyn") || s.includes("ob/gyn") || s.includes("obgyn")) return "OB-GYN"
  if (s.includes("dermatolog")) return "Dermatology"
  if (s.includes("ophthalmolog")) return "Ophthalmology"
  if (s.includes("otolaryngolog") || s.includes("ent")) return "ENT (Otolaryngology)"
  if (s.includes("allerg") || s.includes("immunolog")) return "Allergy & Immunology"
  return "Primary Care"
}

function classifyTaxonomy(desc: string): string | null {
  const d = (desc || "").toLowerCase()
  if (d.includes("cardiovascular disease")) return "Cardiology"
  if (d.includes("pulmonary disease")) return "Pulmonology"
  if (d.includes("endocrinology")) return "Endocrinology"
  if (d.includes("gastroenterology")) return "Gastroenterology"
  if (d.includes("rheumatology")) return "Rheumatology"
  if (d.includes("pain medicine")) return "Pain Management"
  if (d.includes("plastic surgery")) return "Plastic Surgery"
  if (d.includes("orthopaedic surgery") || d.includes("orthopedic surgery")) return "Orthopedic Surgery"
  if (d.includes("sports medicine")) return "Sports Medicine"
  if (d.includes("urology")) return "Urology"
  if (d.includes("dermatology")) return "Dermatology"
  if (d.includes("ophthalmology")) return "Ophthalmology"
  if (d.includes("otolaryngology")) return "ENT (Otolaryngology)"
  if (d.includes("allergy & immunology")) return "Allergy & Immunology"
  if (d.includes("obstetrics & gynecology")) return "OB-GYN"
  if (d.includes("pediatric")) return "Pediatrics"
  if (d.endsWith("psychiatry") || d.includes(", psychiatry")) return "Psychiatry"
  if (d.includes("neurology")) return "Neurology"
  if (d.includes("family medicine")) return "Primary Care"
  if (d.includes("internal medicine")) return "Primary Care"
  return null
}

// ---------------------------------------------------------------------------
// CMS billing-group enrichment (independent vs system-employed) — trimmed copy
// of the discover route's logic.
// ---------------------------------------------------------------------------

const CMS_NDF_DIST = "764c5eba-9595-5c63-9ed8-793ba776f562"
const CMS_BATCH = 50
const CMS_ENRICH_CAP = 40

async function enrichCmsOrgs(npis: string[]): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>()
  if (npis.length === 0) return out

  const { data: cached } = await supabase
    .from("provider_cms_cache")
    .select("npi, org_names")
    .in("npi", npis)
  const cachedSet = new Set<string>()
  for (const row of cached || []) {
    cachedSet.add(row.npi)
    out.set(row.npi, row.org_names || [])
  }

  const misses = npis.filter((n) => !cachedSet.has(n))
  const rowsToUpsert: any[] = []
  for (let i = 0; i < misses.length; i += CMS_BATCH) {
    const chunk = misses.slice(i, i + CMS_BATCH)
    const params = new URLSearchParams()
    params.set("conditions[0][property]", "npi")
    params.set("conditions[0][operator]", "in")
    chunk.forEach((npi, idx) => params.set(`conditions[0][value][${idx}]`, npi))
    params.set("limit", "500")

    const byNpi = new Map<string, Set<string>>()
    try {
      const res = await fetch(
        `https://data.cms.gov/provider-data/api/1/datastore/query/${CMS_NDF_DIST}?${params.toString()}`
      )
      if (res.ok) {
        const data = await res.json()
        for (const r of data.results || []) {
          const npi = String(r.npi)
          const set = byNpi.get(npi) || new Set<string>()
          if (r.facility_name) set.add(r.facility_name)
          byNpi.set(npi, set)
        }
      }
    } catch (e) {
      console.error("CMS enrich error:", e)
    }
    for (const npi of chunk) {
      const orgNames = byNpi.get(npi) ? Array.from(byNpi.get(npi)!) : []
      out.set(npi, orgNames)
      rowsToUpsert.push({ npi, org_names: orgNames, checked: true, updated_at: new Date().toISOString() })
    }
  }
  if (rowsToUpsert.length > 0) {
    try {
      await supabase.from("provider_cms_cache").upsert(rowsToUpsert, { onConflict: "npi" })
    } catch {
      // Cache write needs the service-role key; harmless if it fails (e.g. local).
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Geocoding + NPPES (free, no key) — trimmed copies of the discover route logic
// ---------------------------------------------------------------------------

async function geocodeCensus(oneLine: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(oneLine)}&benchmark=Public_AR_Current&format=json`
    )
    if (!res.ok) return null
    const data = await res.json()
    const match = data.result?.addressMatches?.[0]
    if (match?.coordinates) return { lat: match.coordinates.y, lng: match.coordinates.x }
    return null
  } catch (e) {
    console.error("Census geocode error:", e)
    return null
  }
}

async function geocodeNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", USA")}&format=json&limit=1`,
      { headers: { "User-Agent": "SleftSignals/1.0 (referral-map)" } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    return null
  } catch (e) {
    console.error("Nominatim search error:", e)
    return null
  }
}

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

interface NppesProvider {
  npi: string
  practice_name: string
  specialty: string
  address: string
  city: string
  state: string
  postal_code: string
}

async function fetchNppes(
  loc: { city?: string; state?: string; postal?: string },
  taxonomy: string,
  maxPages = 2
): Promise<NppesProvider[]> {
  const limit = 200
  const out: NppesProvider[] = []
  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      version: "2.1",
      taxonomy_description: taxonomy,
      limit: String(limit),
      skip: String(page * limit),
    })
    if (loc.postal) params.set("postal_code", loc.postal)
    else if (loc.city && loc.state) {
      params.set("city", loc.city)
      params.set("state", loc.state)
    } else if (loc.state) params.set("state", loc.state)
    else break

    try {
      const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params.toString()}`)
      if (!res.ok) break
      const data = await res.json()
      const results = data.results || []
      for (const r of results) {
        const primary = (r.taxonomies || []).find((t: any) => t.primary) || (r.taxonomies || [])[0]
        const specialty = classifyTaxonomy(primary?.desc || "")
        if (!specialty) continue
        const addr = (r.addresses || []).find((a: any) => a.address_purpose === "LOCATION") || (r.addresses || [])[0]
        if (!addr) continue
        const b = r.basic || {}
        const name = (b.organization_name || `${b.first_name || ""} ${b.last_name || ""}`).trim()
        if (!name) continue
        out.push({
          npi: String(r.number),
          practice_name: name,
          specialty,
          address: addr.address_1 || "",
          city: addr.city || "",
          state: addr.state || "",
          postal_code: (addr.postal_code || "").slice(0, 5),
        })
      }
      if (results.length < limit) break
    } catch (e) {
      console.error("NPPES fetch error:", e)
      break
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Public types + engine
// ---------------------------------------------------------------------------

export interface MapPartner {
  npi: string
  practice_name: string
  specialty: string
  distance_miles: number | null
  fit_score: number
  // "inbound" = this partner could send the target patients; "outbound" = the
  // target should send this partner patients.
  direction: "inbound" | "outbound"
  why: string
}

export interface ReferralGap {
  partner: MapPartner
  direction: "inbound" | "outbound"
  // A ready-to-use, clinician-voice one-liner. Outreach copy can use this
  // verbatim or rephrase it.
  sentence: string
}

export interface ReferralMap {
  target: { practice_name?: string; specialty: string; canonical_specialty: string; location: string }
  radius_miles: number
  origin: { lat: number; lng: number } | null
  independent_count: number
  inbound: MapPartner[]
  outbound: MapPartner[]
  gap: ReferralGap | null
  generated_at: string
}

export interface ReferralMapInput {
  practiceName?: string
  specialty: string
  address?: string
  city?: string
  state?: string
  postal?: string
}

const MAX_NAMED = 12
const RADIUS_MILES = 25

// Inbound lanes for L = specialties that refer INTO L (L appears in their
// adjacency list). Outbound lanes for L = ADJACENCY_MAP[L].
function lanesFor(canonical: string): { inbound: Set<string>; outbound: Set<string> } {
  const outbound = new Set<string>(ADJACENCY_MAP[canonical] || [])
  const inbound = new Set<string>()
  for (const [src, targets] of Object.entries(ADJACENCY_MAP)) {
    if (src === canonical) continue
    if (targets.includes(canonical)) inbound.add(src)
  }
  return { inbound, outbound }
}

export async function buildReferralMap(input: ReferralMapInput): Promise<ReferralMap> {
  const canonical = canonicalizeSpecialty(input.specialty)
  const { inbound: inboundLanes, outbound: outboundLanes } = lanesFor(canonical)
  // Union of lanes we will actually search NPPES for (skip non-physician /
  // unqueryable lanes like Obesity Medicine / Registered Dietitian).
  const searchLanes = Array.from(new Set([...inboundLanes, ...outboundLanes])).filter(
    (s) => SPECIALTY_TAXONOMY_QUERY[s]
  )

  const locationLabel = [input.city, input.state].filter(Boolean).join(", ") || input.postal || ""
  const postal5 = (input.postal || "").match(/\b(\d{5})\b/)?.[1]
  const zipPrefix = postal5 ? `${postal5.slice(0, 3)}*` : undefined

  // 1. Resolve the target's own coordinates (the map center).
  let origin: { lat: number; lng: number } | null = null
  if (input.address && locationLabel) {
    origin = await geocodeCensus(`${input.address}, ${locationLabel} ${postal5 || ""}`.trim())
  }
  if (!origin) origin = await geocodeNominatim(postal5 || locationLabel)

  // 2. Sweep NPPES for candidate partners across the lanes.
  const sweepLoc = zipPrefix
    ? { postal: zipPrefix }
    : input.city && input.state
    ? { city: input.city, state: input.state }
    : input.state
    ? { state: input.state }
    : {}

  const byNpi = new Map<string, NppesProvider>()
  for (const lane of searchLanes) {
    for (const q of SPECIALTY_TAXONOMY_QUERY[lane]) {
      const providers = await fetchNppes(sweepLoc, q, 2)
      for (const p of providers) {
        if (p.specialty === lane && !byNpi.has(p.npi)) byNpi.set(p.npi, p)
      }
    }
  }
  let candidates = Array.from(byNpi.values()).slice(0, 240)

  // 3. Coordinates from the Supabase cache; geocode misses in bounded parallel.
  const coordsByNpi = new Map<string, { lat: number; lng: number }>()
  const { data: cachedGeo } = await supabase
    .from("provider_geo_cache")
    .select("npi, latitude, longitude")
    .in("npi", candidates.map((c) => c.npi))
  for (const row of cachedGeo || []) {
    if (row.latitude != null && row.longitude != null) {
      coordsByNpi.set(row.npi, { lat: Number(row.latitude), lng: Number(row.longitude) })
    }
  }
  const toGeocode = candidates.filter((c) => !coordsByNpi.has(c.npi))
  const geoUpserts: any[] = []
  for (let i = 0; i < toGeocode.length; i += 25) {
    const chunk = toGeocode.slice(i, i + 25)
    const geocoded = await Promise.all(
      chunk.map(async (c) => ({
        c,
        coords: await geocodeCensus(`${c.address}, ${c.city}, ${c.state} ${c.postal_code}`),
      }))
    )
    for (const { c, coords } of geocoded) {
      if (coords) coordsByNpi.set(c.npi, coords)
      geoUpserts.push({
        npi: c.npi,
        practice_name: c.practice_name,
        specialty: c.specialty,
        address: c.address,
        city: c.city,
        state: c.state,
        postal_code: c.postal_code,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        geocoded: !!coords,
        updated_at: new Date().toISOString(),
      })
    }
  }
  if (geoUpserts.length > 0) {
    try {
      await supabase.from("provider_geo_cache").upsert(geoUpserts, { onConflict: "npi" })
    } catch {
      // Service-role-only write; harmless if it fails locally.
    }
  }

  // 4. Score + distance-rank, keep within radius (relax if too sparse).
  type Scored = NppesProvider & { distance: number | null; fit: number }
  let scored: Scored[] = candidates.map((c) => {
    const coords = coordsByNpi.get(c.npi) || null
    const distance = coords && origin ? haversineMiles(origin, coords) : null
    const idx = (ADJACENCY_MAP[canonical] || []).indexOf(c.specialty)
    const fit = idx === -1 ? 60 : Math.max(50, 95 - idx * 10)
    return { ...c, distance, fit }
  })
  if (origin) {
    const near = scored.filter((s) => s.distance != null && s.distance <= RADIUS_MILES)
    scored = near.length >= 3 ? near : scored.filter((s) => s.distance != null)
  }
  scored.sort((a, b) => {
    if (a.distance != null && b.distance != null) return a.distance - b.distance
    if (a.distance != null) return -1
    if (b.distance != null) return 1
    return b.fit - a.fit
  })

  // 5. Independent-only via CMS billing group (nearest CMS_ENRICH_CAP).
  const head = scored.slice(0, CMS_ENRICH_CAP)
  const cms = await enrichCmsOrgs(head.map((s) => s.npi))
  const independent = head.filter((s) => {
    const nameSystem = !classifyAffiliation(s.practice_name).isIndependent
    const cmsSystem = classifySystemFromOrgs(cms.get(s.npi) || []).isSystem
    return !(nameSystem || cmsSystem)
  })

  // 6. Split into inbound (could send you patients) / outbound (you send to).
  const toPartner = (s: Scored, direction: "inbound" | "outbound"): MapPartner => ({
    npi: s.npi,
    practice_name: s.practice_name,
    specialty: s.specialty,
    distance_miles: s.distance != null ? Math.round(s.distance * 10) / 10 : null,
    fit_score: s.fit,
    direction,
    why:
      direction === "inbound"
        ? `${s.specialty} practices send ${intakePhrase(canonical)}`
        : `You send ${intakePhrase(s.specialty)}`,
  })

  const inbound: MapPartner[] = []
  const outbound: MapPartner[] = []
  for (const s of independent) {
    if (inboundLanes.has(s.specialty)) inbound.push(toPartner(s, "inbound"))
    if (outboundLanes.has(s.specialty)) outbound.push(toPartner(s, "outbound"))
  }
  inbound.splice(MAX_NAMED)
  outbound.splice(MAX_NAMED)

  // 7. The gap: the single nearby partner the target most likely is not
  //    connected to. For a specialist, lead with who could SEND them patients
  //    (a referral source, usually primary care). For a PCP, lead with the
  //    independent specialist they refer to who would reciprocate.
  let gap: ReferralGap | null = null
  if (canonical === "Primary Care") {
    const pick = outbound[0]
    if (pick) {
      gap = {
        partner: pick,
        direction: "outbound",
        sentence: `There is ${practicePhrase(pick.specialty)} ${proximityPhrase(pick.distance_miles)}. Practices like yours send patients to ${SHORT_NEED[pick.specialty] || pick.specialty.toLowerCase()} constantly, and an independent one sends them back to you instead of keeping them. You two are almost certainly not connected yet.`,
      }
    }
  } else {
    const pick = inbound.find((p) => p.specialty === "Primary Care") || inbound[0] || outbound[0]
    if (pick) {
      const dir = inboundLanes.has(pick.specialty) ? "inbound" : "outbound"
      gap = {
        partner: pick,
        direction: dir,
        sentence:
          dir === "inbound"
            ? `There is ${practicePhrase(pick.specialty)} ${proximityPhrase(pick.distance_miles)} whose patients regularly need ${SHORT_NEED[canonical] || "your care"}, and you two are almost certainly not connected yet.`
            : `There is ${practicePhrase(pick.specialty)} ${proximityPhrase(pick.distance_miles)} that would be a natural referral partner, and you two are almost certainly not connected yet.`,
      }
    }
  }

  return {
    target: { practice_name: input.practiceName, specialty: input.specialty, canonical_specialty: canonical, location: locationLabel },
    radius_miles: RADIUS_MILES,
    origin,
    independent_count: independent.length,
    inbound,
    outbound,
    gap,
    generated_at: new Date().toISOString(),
  }
}
