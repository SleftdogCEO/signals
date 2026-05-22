import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SERPER_API_KEY = process.env.SERPER_API_KEY

interface SerperPlace {
  title: string
  address: string
  rating?: number
  ratingCount?: number
  category?: string
  phoneNumber?: string
  website?: string
  cid?: string
}

interface MatchResult {
  id: string
  practice_name: string
  specialty: string
  location: string
  match_score: number
  why_match: string[]
  address?: string
  phone?: string
  website?: string
  rating?: number
  review_count?: number
  coordinates?: { lat: number; lng: number }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Geocode an address to coordinates using Google Maps
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_MAPS_API_KEY || !address) return null

  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) return null

    const data = await response.json()
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Reverse-geocode lat/lng to a human-readable location (city/state/zip) for
// use as the Serper "near {location}" search term.
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) return null
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality|postal_code|administrative_area_level_1&key=${GOOGLE_MAPS_API_KEY}`
    )
    if (!response.ok) return null
    const data = await response.json()
    return data.results?.[0]?.formatted_address || null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Category mapping for search queries.
// Keys MUST stay in sync with PARTNER_CATEGORIES ids in app/onboarding/page.tsx.
// Each value is a list of Google Places search terms covering the underlying
// physician specialties for that category.
const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  'primary_care': ['family medicine clinic', 'primary care doctor', 'internal medicine practice'],
  'internal_medicine_subspecialties': ['cardiologist', 'pulmonologist', 'endocrinologist', 'gastroenterologist', 'rheumatologist', 'neurologist'],
  'psychiatry_pain': ['psychiatrist', 'pain management doctor'],
  'surgery_msk': ['orthopedic surgeon', 'plastic surgeon', 'urologist', 'sports medicine doctor'],
  'womens_childrens': ['pediatrician office', 'OB-GYN', 'obstetrician gynecologist'],
  'ent_eye_skin_allergy': ['ENT doctor', 'ophthalmologist', 'dermatologist', 'allergist']
}

// Map search results to one of the 19 physician specialties in lib/seo-data.ts.
function getSpecialtyFromCategory(category: string | undefined, searchTerm: string): string {
  const haystack = `${category || ''} ${searchTerm}`.toLowerCase()
  if (haystack.includes('cardiolog')) return 'Cardiology'
  if (haystack.includes('pulmonolog')) return 'Pulmonology'
  if (haystack.includes('endocrinolog')) return 'Endocrinology'
  if (haystack.includes('gastroenterolog')) return 'Gastroenterology'
  if (haystack.includes('rheumatolog')) return 'Rheumatology'
  if (haystack.includes('neurolog')) return 'Neurology'
  if (haystack.includes('psychiatr')) return 'Psychiatry'
  if (haystack.includes('dermatolog')) return 'Dermatology'
  if (haystack.includes('ophthalmolog')) return 'Ophthalmology'
  if (haystack.includes('orthopedic') || haystack.includes('orthopaedic')) return 'Orthopedic Surgery'
  if (haystack.includes('pain management') || haystack.includes('pain clinic')) return 'Pain Management'
  if (haystack.includes('pediatric')) return 'Pediatrics'
  if (haystack.includes('ent') || haystack.includes('otolaryngolog')) return 'ENT (Otolaryngology)'
  if (haystack.includes('allerg') || haystack.includes('immunolog')) return 'Allergy & Immunology'
  if (haystack.includes('urolog')) return 'Urology'
  if (haystack.includes('obgyn') || haystack.includes('ob-gyn') || haystack.includes('ob/gyn') || haystack.includes('obstetric') || haystack.includes('gynecolog')) return 'OB-GYN'
  if (haystack.includes('sports medicine')) return 'Sports Medicine'
  if (haystack.includes('plastic surg')) return 'Plastic Surgery'
  if (haystack.includes('family medicine') || haystack.includes('primary care') || haystack.includes('internal medicine') || haystack.includes('general practice')) return 'Primary Care'
  return 'Physician Practice'
}

// Search for local businesses using Serper Places API
async function searchLocalPartners(location: string, searchTerms: string[]): Promise<MatchResult[]> {
  if (!SERPER_API_KEY) {
    console.warn('SERPER_API_KEY not configured')
    return []
  }

  const results: MatchResult[] = []
  const seenNames = new Set<string>()

  for (const term of searchTerms.slice(0, 3)) { // Limit API calls
    try {
      const response = await fetch('https://google.serper.dev/places', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: `${term} near ${location}`,
          num: 5
        })
      })

      if (!response.ok) {
        console.error('Serper API error:', response.status)
        continue
      }

      const data = await response.json()
      const places: SerperPlace[] = data.places || []

      for (const place of places) {
        // Skip duplicates
        if (seenNames.has(place.title.toLowerCase())) continue
        seenNames.add(place.title.toLowerCase())

        const specialty = getSpecialtyFromCategory(place.category, term)

        // Calculate match score based on rating and relevance
        let score = 75
        if (place.rating && place.rating >= 4.5) score += 15
        else if (place.rating && place.rating >= 4.0) score += 10
        else if (place.rating && place.rating >= 3.5) score += 5

        if (place.ratingCount && place.ratingCount > 100) score += 5
        if (place.website) score += 3
        if (place.phoneNumber) score += 2

        // Geocode the address to get coordinates
        const addressToGeocode = place.address || location
        const coordinates = await geocodeAddress(addressToGeocode)

        results.push({
          id: place.cid || `serper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          practice_name: place.title,
          specialty,
          location: place.address || location,
          match_score: Math.min(score, 98),
          why_match: [
            `Actively practicing ${specialty} in your area`,
            `${place.rating ? `${place.rating} stars` : 'Established practice'} with ${place.ratingCount || 'multiple'} reviews`,
            `Great potential for mutual referral partnership`
          ],
          address: place.address,
          phone: place.phoneNumber,
          website: place.website,
          rating: place.rating,
          review_count: place.ratingCount,
          coordinates: coordinates || undefined
        })
      }
    } catch (error) {
      console.error('Error searching for partners:', error)
    }
  }

  return results
}

// ===========================================================================
// NPPES (NPI Registry) — primary data source. Free, no API key, authoritative
// US provider data. Addresses are geocoded with the free US Census geocoder
// and cached in Supabase (provider_geo_cache). Serper (above) remains as an
// automatic fallback when NPPES yields nothing.
// ===========================================================================

interface NppesProvider {
  npi: string
  practice_name: string
  taxonomy: string
  specialty: string
  address: string
  city: string
  state: string
  postal_code: string
  phone?: string
}

interface SearchLocation { city?: string; state?: string; postal?: string }

// Canonical specialty -> NPPES taxonomy_description substrings to query.
// NPPES does a substring match, so a distinctive specialization word suffices;
// the classifier below removes cross-contaminated matches.
const SPECIALTY_TAXONOMY_QUERY: Record<string, string[]> = {
  'Primary Care': ['Family Medicine', 'Internal Medicine'],
  'Cardiology': ['Cardiovascular Disease'],
  'Pulmonology': ['Pulmonary Disease'],
  'Endocrinology': ['Endocrinology'],
  'Gastroenterology': ['Gastroenterology'],
  'Rheumatology': ['Rheumatology'],
  'Neurology': ['Neurology'],
  'Psychiatry': ['Psychiatry'],
  'Pain Management': ['Pain Medicine'],
  'Orthopedic Surgery': ['Orthopaedic Surgery'],
  'Plastic Surgery': ['Plastic Surgery'],
  'Urology': ['Urology'],
  'Sports Medicine': ['Sports Medicine'],
  'Pediatrics': ['Pediatrics'],
  'OB-GYN': ['Obstetrics & Gynecology'],
  'Dermatology': ['Dermatology'],
  'Ophthalmology': ['Ophthalmology'],
  'ENT (Otolaryngology)': ['Otolaryngology'],
  'Allergy & Immunology': ['Allergy & Immunology'],
}

// Partner category id (patients_i_want) -> canonical specialties.
const CATEGORY_TO_SPECIALTIES: Record<string, string[]> = {
  'primary_care': ['Primary Care'],
  'internal_medicine_subspecialties': ['Cardiology', 'Pulmonology', 'Endocrinology', 'Gastroenterology', 'Rheumatology', 'Neurology'],
  'psychiatry_pain': ['Psychiatry', 'Pain Management'],
  'surgery_msk': ['Orthopedic Surgery', 'Plastic Surgery', 'Urology', 'Sports Medicine'],
  'womens_childrens': ['Pediatrics', 'OB-GYN'],
  'ent_eye_skin_allergy': ['ENT (Otolaryngology)', 'Ophthalmology', 'Dermatology', 'Allergy & Immunology'],
}

// Complementary referral partners by the user's own specialty (used when they
// have not selected specific partner interests).
const COMPLEMENTARY_SPECIALTIES: Record<string, string[]> = {
  'Obesity Medicine': ['Endocrinology', 'Primary Care', 'Gastroenterology', 'Cardiology', 'Psychiatry', 'OB-GYN'],
  'Primary Care': ['Cardiology', 'Endocrinology', 'Psychiatry', 'Dermatology', 'Gastroenterology', 'Orthopedic Surgery'],
  'Cardiology': ['Primary Care', 'Endocrinology', 'Pulmonology'],
  'Pulmonology': ['Primary Care', 'Allergy & Immunology', 'Cardiology', 'ENT (Otolaryngology)'],
  'Endocrinology': ['Primary Care', 'Cardiology', 'Pediatrics', 'OB-GYN'],
  'Gastroenterology': ['Primary Care', 'Pediatrics', 'Rheumatology', 'Allergy & Immunology'],
  'Rheumatology': ['Primary Care', 'Dermatology', 'Pain Management', 'Gastroenterology'],
  'Neurology': ['Primary Care', 'Psychiatry', 'Pediatrics', 'Pain Management'],
  'Psychiatry': ['Primary Care', 'Pediatrics', 'Neurology', 'Pain Management'],
  'Dermatology': ['Primary Care', 'Plastic Surgery', 'Allergy & Immunology', 'Pediatrics'],
  'Ophthalmology': ['Primary Care', 'Endocrinology', 'Pediatrics', 'Neurology'],
  'Orthopedic Surgery': ['Pain Management', 'Primary Care', 'Sports Medicine'],
  'Pain Management': ['Primary Care', 'Orthopedic Surgery', 'Rheumatology', 'Psychiatry'],
  'Pediatrics': ['Allergy & Immunology', 'ENT (Otolaryngology)', 'Psychiatry', 'Endocrinology'],
  'ENT (Otolaryngology)': ['Primary Care', 'Allergy & Immunology', 'Pulmonology', 'Pediatrics'],
  'Allergy & Immunology': ['Primary Care', 'ENT (Otolaryngology)', 'Pediatrics', 'Pulmonology'],
  'Urology': ['Primary Care', 'OB-GYN'],
  'OB-GYN': ['Primary Care', 'Endocrinology', 'Urology', 'Psychiatry'],
  'Sports Medicine': ['Orthopedic Surgery', 'Primary Care', 'Endocrinology'],
  'Plastic Surgery': ['Dermatology', 'Primary Care', 'OB-GYN'],
}

const US_STATE_ABBR: Record<string, string> = {
  'alabama':'AL','alaska':'AK','arizona':'AZ','arkansas':'AR','california':'CA','colorado':'CO','connecticut':'CT','delaware':'DE','florida':'FL','georgia':'GA','hawaii':'HI','idaho':'ID','illinois':'IL','indiana':'IN','iowa':'IA','kansas':'KS','kentucky':'KY','louisiana':'LA','maine':'ME','maryland':'MD','massachusetts':'MA','michigan':'MI','minnesota':'MN','mississippi':'MS','missouri':'MO','montana':'MT','nebraska':'NE','nevada':'NV','new hampshire':'NH','new jersey':'NJ','new mexico':'NM','new york':'NY','north carolina':'NC','north dakota':'ND','ohio':'OH','oklahoma':'OK','oregon':'OR','pennsylvania':'PA','rhode island':'RI','south carolina':'SC','south dakota':'SD','tennessee':'TN','texas':'TX','utah':'UT','vermont':'VT','virginia':'VA','washington':'WA','west virginia':'WV','wisconsin':'WI','wyoming':'WY','district of columbia':'DC'
}

// Map a free-text specialty to one of our canonical specialty keys.
function canonicalizeSpecialty(raw: string): string {
  const s = (raw || '').toLowerCase()
  if (s.includes('obesity') || s.includes('weight')) return 'Obesity Medicine'
  if (s.includes('primary') || s.includes('family') || s.includes('internal medicine') || s.includes('general practice')) return 'Primary Care'
  if (s.includes('cardio')) return 'Cardiology'
  if (s.includes('pulmonolog')) return 'Pulmonology'
  if (s.includes('endocrinolog')) return 'Endocrinology'
  if (s.includes('gastroenterolog')) return 'Gastroenterology'
  if (s.includes('rheumatolog')) return 'Rheumatology'
  if (s.includes('neurolog')) return 'Neurology'
  if (s.includes('psychiatr')) return 'Psychiatry'
  if (s.includes('pain')) return 'Pain Management'
  if (s.includes('orthop')) return 'Orthopedic Surgery'
  if (s.includes('plastic')) return 'Plastic Surgery'
  if (s.includes('urolog')) return 'Urology'
  if (s.includes('sports medicine')) return 'Sports Medicine'
  if (s.includes('pediatric')) return 'Pediatrics'
  if (s.includes('obstetric') || s.includes('gynecolog') || s.includes('ob-gyn') || s.includes('ob/gyn') || s.includes('obgyn')) return 'OB-GYN'
  if (s.includes('dermatolog')) return 'Dermatology'
  if (s.includes('ophthalmolog')) return 'Ophthalmology'
  if (s.includes('otolaryngolog') || s.includes('ent')) return 'ENT (Otolaryngology)'
  if (s.includes('allerg') || s.includes('immunolog')) return 'Allergy & Immunology'
  return 'Primary Care'
}

// Classify an NPPES taxonomy "desc" string to a canonical specialty. Order
// matters: subspecialties before broad classifications, and Psychiatry before
// Neurology since both share the classification "Psychiatry & Neurology".
function classifyTaxonomy(desc: string): string | null {
  const d = (desc || '').toLowerCase()
  if (d.includes('cardiovascular disease')) return 'Cardiology'
  if (d.includes('pulmonary disease')) return 'Pulmonology'
  if (d.includes('endocrinology')) return 'Endocrinology'
  if (d.includes('gastroenterology')) return 'Gastroenterology'
  if (d.includes('rheumatology')) return 'Rheumatology'
  if (d.includes('pain medicine')) return 'Pain Management'
  if (d.includes('plastic surgery')) return 'Plastic Surgery'
  if (d.includes('orthopaedic surgery') || d.includes('orthopedic surgery')) return 'Orthopedic Surgery'
  if (d.includes('sports medicine')) return 'Sports Medicine'
  if (d.includes('urology')) return 'Urology'
  if (d.includes('dermatology')) return 'Dermatology'
  if (d.includes('ophthalmology')) return 'Ophthalmology'
  if (d.includes('otolaryngology')) return 'ENT (Otolaryngology)'
  if (d.includes('allergy & immunology')) return 'Allergy & Immunology'
  if (d.includes('obstetrics & gynecology')) return 'OB-GYN'
  if (d.includes('pediatric')) return 'Pediatrics'
  if (d.endsWith('psychiatry') || d.includes(', psychiatry')) return 'Psychiatry'
  if (d.includes('neurology')) return 'Neurology'
  if (d.includes('family medicine')) return 'Primary Care'
  if (d.includes('internal medicine')) return 'Primary Care'
  return null
}

// Parse a free-text location ("33606", "Tampa, FL", "Texas") into NPPES params.
function parseLocation(raw: string): SearchLocation {
  const str = (raw || '').trim()
  if (!str) return {}
  const zipMatch = str.match(/\b(\d{5})\b/)
  if (zipMatch) return { postal: zipMatch[1] }
  const parts = str.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const statePart = parts[parts.length - 1]
    const state = statePart.length === 2 ? statePart.toUpperCase() : (US_STATE_ABBR[statePart.toLowerCase()] || '')
    return { city: parts[0], state }
  }
  if (str.length === 2) return { state: str.toUpperCase() }
  if (US_STATE_ABBR[str.toLowerCase()]) return { state: US_STATE_ABBR[str.toLowerCase()] }
  return { city: str }
}

// Reverse-geocode GPS to city/state/zip using free OSM Nominatim, falling back
// to Google if available.
async function reverseGeocodeToLocation(lat: number, lng: number): Promise<SearchLocation> {
  try {
    // zoom=18 (full address detail) so we get the actual city/town. NOTE: never
    // fall back to county — NPPES city search does not match county names, so a
    // county would return 0 results. If no city is found we rely on postal/state.
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'SleftSignals/1.0 (referral-network)' } }
    )
    if (res.ok) {
      const data = await res.json()
      const a = data.address || {}
      const city = a.city || a.town || a.village || a.municipality || a.hamlet || undefined
      const state = a.state ? (US_STATE_ABBR[String(a.state).toLowerCase()] || '') : ''
      const postal = a.postcode ? String(a.postcode).slice(0, 5) : undefined
      if (city || state || postal) return { city, state, postal }
    }
  } catch (e) {
    console.error('Nominatim reverse error:', e)
  }
  const readable = await reverseGeocode(lat, lng)
  return readable ? parseLocation(readable) : {}
}

// Forward-geocode a US address to lat/lng using the free US Census geocoder.
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
    console.error('Census geocode error:', e)
    return null
  }
}

// Geocode a free-text place (ZIP, "City, ST", state) to coordinates via free
// OSM Nominatim. Used for map centering when we have no GPS fix (Census can't
// resolve a bare ZIP or city without a street address).
async function geocodeSearchNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', USA')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'SleftSignals/1.0 (referral-network)' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    return null
  } catch (e) {
    console.error('Nominatim search error:', e)
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

// Query NPPES for providers, with pagination. `loc.postal` may be a 3-digit
// metro prefix wildcard ("336*") to sweep an entire metro ZIP region rather
// than a single exact city (which misses CDP/neighborhood naming mismatches).
// NPPES returns up to 200 results per page and up to 1,200 total via `skip`.
async function fetchNppes(
  loc: SearchLocation,
  taxonomy: string,
  opts: { limit?: number; maxPages?: number } = {}
): Promise<NppesProvider[]> {
  const limit = Math.min(opts.limit ?? 200, 200)
  const maxPages = opts.maxPages ?? 1
  const out: NppesProvider[] = []

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      version: '2.1',
      taxonomy_description: taxonomy,
      limit: String(limit),
      skip: String(page * limit),
    })
    // postal_code (incl. wildcard) sweeps the metro; radius filtering downstream
    // drops the mailing-address scatter NPPES introduces.
    if (loc.postal) params.set('postal_code', loc.postal)
    else if (loc.city && loc.state) { params.set('city', loc.city); params.set('state', loc.state) }
    else if (loc.state) params.set('state', loc.state)
    else break

    try {
      const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params.toString()}`)
      if (!res.ok) break
      const data = await res.json()
      const results = data.results || []
      for (const r of results) {
        const primary = (r.taxonomies || []).find((t: any) => t.primary) || (r.taxonomies || [])[0]
        const specialty = classifyTaxonomy(primary?.desc || '')
        if (!specialty) continue
        const addr = (r.addresses || []).find((a: any) => a.address_purpose === 'LOCATION') || (r.addresses || [])[0]
        if (!addr) continue
        const b = r.basic || {}
        const name = (b.organization_name || `${b.first_name || ''} ${b.last_name || ''}`).trim()
        if (!name) continue
        out.push({
          npi: String(r.number),
          practice_name: name,
          taxonomy: primary?.desc || '',
          specialty,
          address: addr.address_1 || '',
          city: addr.city || '',
          state: addr.state || '',
          postal_code: (addr.postal_code || '').slice(0, 5),
          phone: addr.telephone_number || undefined,
        })
      }
      // Last page reached when NPPES returns fewer than requested.
      if (results.length < limit) break
    } catch (e) {
      console.error('NPPES fetch error:', e)
      break
    }
  }
  return out
}

// What each specialty TAKES IN — the kind of patients a practice of that
// specialty receives referrals for. Both directions of a match are derived from
// this single map, so the reasons are always correct regardless of who is
// viewing whom:
//   outbound (you -> them) = what the PARTNER takes in
//   inbound  (them -> you) = what YOUR specialty takes in
const RECEIVES: Record<string, string> = {
  'Primary Care': 'patients needing a primary-care home and chronic-disease management',
  'Obesity Medicine': 'overweight, obese, and metabolic-syndrome patients for medical weight management',
  'Cardiology': 'patients with hypertension, arrhythmia, or chest pain',
  'Pulmonology': 'patients with chronic cough, COPD, or suspected sleep apnea',
  'Endocrinology': 'patients with complex diabetes, thyroid, or metabolic disorders',
  'Gastroenterology': 'patients with GI symptoms, IBD, or due for a colonoscopy',
  'Rheumatology': 'patients with autoimmune or inflammatory-arthritis symptoms',
  'Neurology': 'patients with headache, seizures, or neuropathy',
  'Psychiatry': 'patients needing depression, anxiety, or medication management',
  'Dermatology': 'patients with suspicious lesions, chronic rashes, or skin-cancer screening needs',
  'Ophthalmology': 'patients needing diabetic eye exams or vision-loss evaluation',
  'Orthopedic Surgery': 'patients with fractures, joint pain, or surgical MSK needs',
  'Pain Management': 'patients with chronic or post-surgical pain',
  'Pediatrics': 'pediatric patients and the children of your patients',
  'ENT (Otolaryngology)': 'patients with sinus, hearing, or throat complaints',
  'Allergy & Immunology': 'patients with allergies, asthma, or immune workups',
  'Urology': 'patients with urologic or men’s-health concerns',
  'OB-GYN': 'women needing prenatal, gynecologic, or PCOS care',
  'Sports Medicine': 'patients with sports injuries or MSK overuse',
  'Plastic Surgery': 'patients needing reconstructive or cosmetic surgical evaluation',
}

// What a practice takes in. Prefer its own specific service tags (members);
// fall back to its specialty's intake (cold NPPES leads have no services).
function intakePhrase(specialty: string, serviceTags?: string[] | null): string {
  if (serviceTags && serviceTags.length > 0) {
    return `patients who need ${serviceTags.slice(0, 3).join(", ")}`
  }
  return RECEIVES[specialty] || `patients who need ${specialty.toLowerCase()} care`
}

// Build directionally-correct, mutual why-match reasons.
//   A -> B ("You refer ...")  = what the PARTNER (B) takes in
//   B -> A ("They refer ...") = what the VIEWER (A) takes in
// Each side uses the practice's own service tags when known, else its specialty.
// Since A is always a known member, the inbound line can always be specific.
function mutualFitReasons(
  userSpecialty: string,
  userServiceTags: string[] | null | undefined,
  partnerSpecialty: string,
  partnerServiceTags: string[] | null | undefined,
  distance: number | null
): string[] {
  return [
    distance != null
      ? `${distance.toFixed(1)} miles from your practice`
      : 'In your local area',
    `You refer ${intakePhrase(partnerSpecialty, partnerServiceTags)}`,
    `They refer ${intakePhrase(userSpecialty, userServiceTags)}`,
  ]
}

// Geocode uncached providers this many at a time (parallel within a chunk).
const GEOCODE_CHUNK = 25
// Bound geocoding work per request; the Supabase cache fills across loads so
// repeat visits progressively cover more of the metro.
const MAX_GEOCODE_CANDIDATES = 240

// Discover partners via NPPES + free geocoding, cached in Supabase. Sweeps the
// whole metro by ZIP prefix, then keeps everything within `radiusMiles`.
async function searchNppesPartners(
  loc: SearchLocation,
  desiredSpecialties: string[],
  origin: { lat: number; lng: number } | null,
  userSpecialty: string,
  userServiceTags: string[] | null | undefined,
  radiusMiles = 25
): Promise<MatchResult[]> {
  // 1. Pull candidates from NPPES for each desired specialty. Prefer a 3-digit
  //    ZIP-prefix sweep ("336*") so the whole metro is covered; fall back to
  //    city/state, then full ZIP, then state.
  const gather = async (where: SearchLocation, maxPages: number): Promise<Map<string, NppesProvider>> => {
    const map = new Map<string, NppesProvider>()
    for (const specialty of desiredSpecialties.slice(0, 6)) {
      for (const q of (SPECIALTY_TAXONOMY_QUERY[specialty] || [specialty])) {
        const providers = await fetchNppes(where, q, { limit: 200, maxPages })
        for (const p of providers) {
          if (p.specialty === specialty && !map.has(p.npi)) map.set(p.npi, p)
        }
      }
    }
    return map
  }

  const zipPrefix = loc.postal && /^\d{5}$/.test(loc.postal) ? `${loc.postal.slice(0, 3)}*` : null

  let byNpi: Map<string, NppesProvider>
  if (zipPrefix) byNpi = await gather({ postal: zipPrefix }, 2)
  else if (loc.city && loc.state) byNpi = await gather({ city: loc.city, state: loc.state }, 2)
  else if (loc.postal) byNpi = await gather({ postal: loc.postal }, 2)
  else if (loc.state) byNpi = await gather({ state: loc.state }, 1)
  else return []

  // Last-ditch retry by city/state if the ZIP sweep came back empty.
  if (byNpi.size === 0 && loc.city && loc.state) byNpi = await gather({ city: loc.city, state: loc.state }, 2)

  let candidates = Array.from(byNpi.values())
  if (candidates.length === 0) return []
  candidates = candidates.slice(0, MAX_GEOCODE_CANDIDATES)

  // 2. Resolve coordinates from the Supabase cache; geocode the misses in
  //    bounded parallel chunks and write them back to the cache.
  const coordsByNpi = new Map<string, { lat: number; lng: number }>()
  const { data: cached } = await supabase
    .from('provider_geo_cache')
    .select('npi, latitude, longitude')
    .in('npi', candidates.map(c => c.npi))
  for (const row of cached || []) {
    if (row.latitude != null && row.longitude != null) {
      coordsByNpi.set(row.npi, { lat: Number(row.latitude), lng: Number(row.longitude) })
    }
  }

  const toGeocode = candidates.filter(c => !coordsByNpi.has(c.npi))
  const rowsToUpsert: any[] = []
  for (let i = 0; i < toGeocode.length; i += GEOCODE_CHUNK) {
    const chunk = toGeocode.slice(i, i + GEOCODE_CHUNK)
    const geocoded = await Promise.all(
      chunk.map(async (c) => {
        const coords = await geocodeCensus(`${c.address}, ${c.city}, ${c.state} ${c.postal_code}`)
        return { c, coords }
      })
    )
    for (const { c, coords } of geocoded) {
      if (coords) coordsByNpi.set(c.npi, coords)
      rowsToUpsert.push({
        npi: c.npi,
        practice_name: c.practice_name,
        specialty: c.specialty,
        taxonomy: c.taxonomy,
        address: c.address,
        city: c.city,
        state: c.state,
        postal_code: c.postal_code,
        phone: c.phone || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        geocoded: !!coords,
        updated_at: new Date().toISOString(),
      })
    }
  }
  if (rowsToUpsert.length > 0) {
    await supabase.from('provider_geo_cache').upsert(rowsToUpsert, { onConflict: 'npi' })
  }

  // 3. Build, score, and sort results (closest first when we have an origin).
  const results = candidates.map((c) => {
    const coords = coordsByNpi.get(c.npi) || null
    const distance = coords && origin ? haversineMiles(origin, coords) : null

    let score = 70
    if (distance != null) {
      if (distance < 5) score += 25
      else if (distance < 10) score += 18
      else if (distance < 20) score += 10
      else if (distance < 40) score += 5
    }
    if (c.phone) score += 3

    return {
      id: c.npi,
      practice_name: c.practice_name,
      specialty: c.specialty,
      location: [c.city, c.state].filter(Boolean).join(', '),
      match_score: Math.min(score, 98),
      why_match: mutualFitReasons(userSpecialty, userServiceTags, c.specialty, undefined, distance),
      address: c.address ? `${c.address}, ${c.city}, ${c.state} ${c.postal_code}`.trim() : undefined,
      phone: c.phone,
      website: undefined,
      coordinates: coords || undefined,
      _distance: distance,
    } as MatchResult & { _distance: number | null }
  })

  // Keep results within the requested radius; relax progressively so users in
  // sparse areas still see partners.
  let finalResults = results
  if (origin) {
    const near = results.filter((r: any) => r._distance != null && r._distance <= radiusMiles)
    if (near.length >= 3) finalResults = near
    else {
      const wider = results.filter((r: any) => r._distance != null && r._distance <= radiusMiles * 2)
      if (wider.length >= 3) finalResults = wider
      else {
        const anyCoords = results.filter((r: any) => r._distance != null)
        finalResults = anyCoords.length > 0 ? anyCoords : results
      }
    }
  }

  finalResults.sort((a: any, b: any) => {
    if (a._distance != null && b._distance != null) return a._distance - b._distance
    if (a._distance != null) return -1
    if (b._distance != null) return 1
    return b.match_score - a.match_score
  })
  return finalResults.map(({ _distance, ...m }: any) => m)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    // Optional precise location overrides (from browser geolocation or a zip/city
    // the user typed). When present, these take priority over the coarse
    // onboarding location so "near me" searches actually center on the user.
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const locParam = searchParams.get('loc')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    // Get current user's provider profile
    const { data: currentProvider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (providerError || !currentProvider) {
      return NextResponse.json(
        { error: 'Provider profile not found. Complete onboarding first.' },
        { status: 404 }
      )
    }

    // Check subscription status
    const isSubscribed = currentProvider.subscription_status === 'active'
    const isTrialing = currentProvider.subscription_status === 'trial'
    const hasAccess = isSubscribed || isTrialing

    const userInterests = currentProvider.patients_i_want || []

    // Resolve the location to search around. Priority:
    //   1. Browser geolocation (lat/lng) -> reverse-geocoded to a city/zip
    //   2. A zip/city the user typed (loc)
    //   3. The coarse onboarding location (fallback)
    let userLocation = currentProvider.location || ''
    let origin: { lat: number; lng: number } | null = null
    let searchLoc: SearchLocation

    if (latParam && lngParam) {
      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        origin = { lat, lng }
        searchLoc = await reverseGeocodeToLocation(lat, lng)
        userLocation = [searchLoc.city, searchLoc.state].filter(Boolean).join(', ') || searchLoc.postal || userLocation
      } else {
        searchLoc = parseLocation(userLocation)
      }
    } else if (locParam && locParam.trim()) {
      userLocation = locParam.trim()
      searchLoc = parseLocation(userLocation)
    } else {
      searchLoc = parseLocation(userLocation)
    }

    // Build search terms based on user interests
    const searchTerms: string[] = []
    for (const interest of userInterests) {
      const terms = CATEGORY_SEARCH_TERMS[interest] || []
      searchTerms.push(...terms)
    }

    // If no specific interests, search for complementary specialties based on user's specialty.
    // Each branch matches one of the 19 physician specialties from lib/seo-data.ts.
    if (searchTerms.length === 0) {
      const userSpecialty = (currentProvider.specialty || '').toLowerCase()

      if (userSpecialty.includes('obesity') || userSpecialty.includes('weight')) {
        searchTerms.push('endocrinologist', 'primary care doctor', 'gastroenterologist', 'cardiologist', 'OB-GYN')
      } else if (userSpecialty.includes('primary') || userSpecialty.includes('family') || userSpecialty.includes('internal medicine')) {
        searchTerms.push('cardiologist', 'endocrinologist', 'psychiatrist', 'dermatologist', 'gastroenterologist', 'orthopedic surgeon')
      } else if (userSpecialty.includes('cardio')) {
        searchTerms.push('primary care doctor', 'endocrinologist', 'pulmonologist', 'family medicine clinic')
      } else if (userSpecialty.includes('pulmonolog')) {
        searchTerms.push('primary care doctor', 'allergist', 'cardiologist', 'ENT doctor')
      } else if (userSpecialty.includes('endocrinolog')) {
        searchTerms.push('primary care doctor', 'cardiologist', 'pediatrician office', 'OB-GYN')
      } else if (userSpecialty.includes('gastroenterolog')) {
        searchTerms.push('primary care doctor', 'pediatrician office', 'rheumatologist', 'allergist')
      } else if (userSpecialty.includes('rheumatolog')) {
        searchTerms.push('primary care doctor', 'dermatologist', 'pain management doctor', 'gastroenterologist')
      } else if (userSpecialty.includes('neurolog')) {
        searchTerms.push('primary care doctor', 'psychiatrist', 'pediatrician office', 'pain management doctor')
      } else if (userSpecialty.includes('psychiatr')) {
        searchTerms.push('primary care doctor', 'pediatrician office', 'neurologist', 'pain management doctor')
      } else if (userSpecialty.includes('derma')) {
        searchTerms.push('primary care doctor', 'plastic surgeon', 'allergist', 'pediatrician office')
      } else if (userSpecialty.includes('ophthalmolog')) {
        searchTerms.push('primary care doctor', 'endocrinologist', 'pediatrician office', 'neurologist')
      } else if (userSpecialty.includes('orthopedic')) {
        searchTerms.push('pain management doctor', 'primary care doctor', 'sports medicine doctor')
      } else if (userSpecialty.includes('pain management')) {
        searchTerms.push('primary care doctor', 'orthopedic surgeon', 'rheumatologist', 'psychiatrist')
      } else if (userSpecialty.includes('pediatric')) {
        searchTerms.push('allergist', 'ENT doctor', 'psychiatrist', 'endocrinologist')
      } else if (userSpecialty.includes('ent') || userSpecialty.includes('otolaryngolog')) {
        searchTerms.push('primary care doctor', 'allergist', 'pulmonologist', 'pediatrician office')
      } else if (userSpecialty.includes('allerg') || userSpecialty.includes('immunolog')) {
        searchTerms.push('primary care doctor', 'ENT doctor', 'pediatrician office', 'pulmonologist')
      } else if (userSpecialty.includes('urolog')) {
        searchTerms.push('primary care doctor', 'OB-GYN')
      } else if (userSpecialty.includes('ob-gyn') || userSpecialty.includes('ob/gyn') || userSpecialty.includes('obgyn')) {
        searchTerms.push('primary care doctor', 'endocrinologist', 'urologist', 'psychiatrist')
      } else if (userSpecialty.includes('sports medicine')) {
        searchTerms.push('orthopedic surgeon', 'primary care doctor', 'endocrinologist')
      } else if (userSpecialty.includes('plastic')) {
        searchTerms.push('dermatologist', 'primary care doctor', 'OB-GYN')
      } else {
        // Unknown specialty: search a balanced set of physician partner types
        searchTerms.push('primary care doctor', 'cardiologist', 'psychiatrist', 'orthopedic surgeon')
      }
    }

    // Determine which partner specialties to search for (canonical names).
    // Always ANCHOR on the user's own specialty so recommendations stay tailored
    // to their industry. The onboarding categories only narrow that set — they
    // never pull in unrelated fields (e.g. a weight-loss practice should not be
    // shown rheumatology just because a broad category was auto-selected).
    const userCanonical = canonicalizeSpecialty(currentProvider.specialty || '')
    const specialtyComplementary =
      COMPLEMENTARY_SPECIALTIES[userCanonical] || ['Primary Care', 'Cardiology', 'Psychiatry', 'Orthopedic Surgery']

    const categorySpecialties: string[] = []
    for (const interest of userInterests) {
      categorySpecialties.push(...(CATEGORY_TO_SPECIALTIES[interest] || []))
    }

    let desiredSpecialties: string[]
    if (categorySpecialties.length > 0) {
      // Keep the overlap of "what suits your specialty" and "what you chose",
      // preserving the clinically-ordered complementary list. Fall back to the
      // chosen categories only when there is no overlap at all.
      const overlap = specialtyComplementary.filter(s => categorySpecialties.includes(s))
      desiredSpecialties = overlap.length > 0 ? overlap : categorySpecialties
    } else {
      desiredSpecialties = specialtyComplementary
    }
    // De-dupe and never recommend the user's own specialty (no competitors).
    desiredSpecialties = Array.from(new Set(desiredSpecialties)).filter(s => s !== userCanonical)

    // Resolve the map origin (for centering + distance sorting) when we don't
    // already have GPS coordinates.
    if (!origin) {
      const centerQuery = searchLoc.postal || [searchLoc.city, searchLoc.state].filter(Boolean).join(', ') || userLocation
      origin = centerQuery ? await geocodeSearchNominatim(centerQuery) : null
    }
    // Backfill any missing city/state/ZIP from the origin so the ZIP-prefix
    // metro sweep and the city fallback both have what they need.
    if (origin && (!searchLoc.city || !searchLoc.state || !searchLoc.postal)) {
      const rev = await reverseGeocodeToLocation(origin.lat, origin.lng)
      searchLoc = {
        city: searchLoc.city || rev.city,
        state: searchLoc.state || rev.state,
        postal: searchLoc.postal || rev.postal,
      }
    }

    // Primary source: NPPES (free, no key). Fallback: Serper, if configured.
    let matches = await searchNppesPartners(searchLoc, desiredSpecialties, origin, userCanonical, currentProvider.service_tags || [], 25)
    if (matches.length === 0 && SERPER_API_KEY) {
      matches = await searchLocalPartners(userLocation, searchTerms)
      matches = matches.filter(m => canonicalizeSpecialty(m.specialty) !== userCanonical)
      matches.sort((a, b) => b.match_score - a.match_score)
    }

    // Limit results
    matches = matches.slice(0, 40)

    // If no access, hide contact info (but keep coordinates for map)
    if (!hasAccess) {
      matches = matches.map(m => ({
        ...m,
        phone: undefined,
        website: undefined,
        address: m.address ? m.address.split(',').slice(-2).join(',').trim() : undefined // Show only city/state
        // Keep coordinates for map display
      }))
    }

    const centerCoordinates = origin

    return NextResponse.json({
      matches,
      total: matches.length,
      subscription_status: currentProvider.subscription_status,
      is_subscribed: isSubscribed,
      is_trialing: isTrialing,
      current_provider: {
        id: currentProvider.id,
        practice_name: currentProvider.practice_name,
        specialty: currentProvider.specialty,
        location: currentProvider.location
      },
      center_coordinates: centerCoordinates,
      search_location: userLocation
    })
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
