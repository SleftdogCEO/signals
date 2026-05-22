/**
 * Seed the provider directory with real local physician practices.
 *
 * Pulls public business listings from the Serper Places API and inserts them
 * into the `providers` table as unclaimed seeded rows (user_id = NULL,
 * is_seeded = true). The directory is populated immediately and these rows
 * double as an outreach call list. When a real physician onboards with a
 * matching practice name + location, onboarding claims the seeded row.
 *
 * Idempotent: a practice whose name already exists is skipped.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS to insert user_id = NULL rows)
 *   SERPER_API_KEY
 *
 * Run:  node --env-file=.env.local scripts/seed-providers.mjs
 * Optionally pass a region:  node --env-file=.env.local scripts/seed-providers.mjs "Orlando, FL"
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}
if (!SERPER_API_KEY) {
  console.error("Missing SERPER_API_KEY (needed to pull real practice listings).")
  process.exit(1)
}

const REGION = process.argv[2] || "Tampa, FL"

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Each entry: the canonical specialty stored in providers.specialty (must match
// SPECIALTY_OPTIONS in lib/directory.ts) and the Google search term.
const SPECIALTY_QUERIES = [
  { specialty: "Primary Care", query: "primary care doctor" },
  { specialty: "Cardiology", query: "cardiologist" },
  { specialty: "Pulmonology", query: "pulmonologist" },
  { specialty: "Endocrinology", query: "endocrinologist" },
  { specialty: "Gastroenterology", query: "gastroenterologist" },
  { specialty: "Rheumatology", query: "rheumatologist" },
  { specialty: "Neurology", query: "neurologist" },
  { specialty: "Psychiatry", query: "psychiatrist" },
  { specialty: "Dermatology", query: "dermatologist" },
  { specialty: "Ophthalmology", query: "ophthalmologist" },
  { specialty: "Orthopedic Surgery", query: "orthopedic surgeon" },
  { specialty: "Pain Management", query: "pain management doctor" },
  { specialty: "Pediatrics", query: "pediatrician" },
  { specialty: "ENT (Otolaryngology)", query: "ENT doctor" },
  { specialty: "Allergy & Immunology", query: "allergist" },
  { specialty: "Urology", query: "urologist" },
  { specialty: "OB-GYN", query: "OB-GYN" },
  { specialty: "Sports Medicine", query: "sports medicine doctor" },
  { specialty: "Plastic Surgery", query: "plastic surgeon" },
]

// Reduce a full street address to "City, ST".
function cleanLocation(address, fallback) {
  if (!address) return fallback
  const parts = address.split(",").map((p) => p.trim())
  if (parts.length >= 2) {
    const city = parts[parts.length - 2]
    const stateZip = parts[parts.length - 1]
    const state = stateZip.split(" ")[0]
    if (city && state) return `${city}, ${state}`
  }
  return fallback
}

async function searchSerper(query) {
  const res = await fetch("https://google.serper.dev/places", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: `${query} near ${REGION}`, num: 10 }),
  })
  if (!res.ok) {
    console.warn(`  Serper error ${res.status} for "${query}"`)
    return []
  }
  const data = await res.json()
  return data.places || []
}

async function main() {
  console.log(`Seeding provider directory for region: ${REGION}\n`)

  // Existing practice names (lowercased) so re-runs don't duplicate.
  const { data: existing } = await supabase
    .from("providers")
    .select("practice_name")
  const seen = new Set(
    (existing || []).map((p) => (p.practice_name || "").toLowerCase().trim())
  )

  const rows = []

  for (const { specialty, query } of SPECIALTY_QUERIES) {
    process.stdout.write(`${specialty}... `)
    const places = await searchSerper(query)
    let added = 0

    for (const place of places) {
      const name = (place.title || "").trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)

      rows.push({
        user_id: null,
        is_seeded: true,
        is_active: true,
        is_verified: false,
        network_opted_in: true,
        practice_name: name,
        specialty,
        location: cleanLocation(place.address, REGION),
        bio: null,
        website: place.website || null,
        phone: place.phoneNumber || null,
        email: null,
        patients_i_want: [],
        patients_i_refer: [],
        rating: place.rating ?? null,
        review_count: place.ratingCount ?? null,
        latitude: place.latitude ?? null,
        longitude: place.longitude ?? null,
      })
      added++
    }
    console.log(`${added} new`)
  }

  if (rows.length === 0) {
    console.log("\nNothing new to insert.")
    return
  }

  // Insert in batches.
  let inserted = 0
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    const { error } = await supabase.from("providers").insert(batch)
    if (error) {
      console.error("Insert error:", error.message)
    } else {
      inserted += batch.length
    }
  }

  console.log(`\nDone. Inserted ${inserted} seeded providers.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
