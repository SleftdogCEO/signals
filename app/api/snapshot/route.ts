import { NextRequest, NextResponse } from "next/server"
import { getAdjacentSpecialties, calculateFitScore } from "@/lib/adjacency-map"
import { sendSnapshotEmail, sendLeadNotification } from "@/lib/email"
import { sendViralOutreach } from "@/lib/viral-outreach"

const SERPER_API_KEY = process.env.SERPER_API_KEY
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || 'Snapshot Leads'

interface SnapshotLeadData {
  email: string
  specialty: string
  location: string
  practiceName: string
  sourcesCount: number
  avgFitScore: number
}

interface ReferralSource {
  name: string
  specialty: string
  address: string
  distance: string
  rating: number
  reviewCount: number
  website: string | null
  phone: string | null
  fitScore: number
}

interface SerperPlace {
  title: string
  address: string
  rating?: number
  ratingCount?: number
  phoneNumber?: string
  website?: string
  category?: string
}

async function storeSnapshotLead(data: SnapshotLeadData) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.log('⚠️ Airtable not configured, skipping lead storage')
    return { success: false, error: 'Airtable not configured' }
  }

  try {
    const record = {
      fields: {
        'Email': data.email,
        'Specialty': data.specialty,
        'Location': data.location,
        'Practice Name': data.practiceName,
        'Sources Found': data.sourcesCount,
        'Avg Fit Score': data.avgFitScore,
        'Created At': new Date().toISOString(),
        'Source': 'Snapshot Lead Magnet'
      }
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_LEADS_TABLE)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [record] })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Airtable error:', errorData)
      return { success: false, error: errorData }
    }

    const result = await response.json()
    console.log('✅ Snapshot lead stored in Airtable:', result.records[0].id)
    return { success: true, recordId: result.records[0].id }

  } catch (error) {
    console.error('❌ Failed to store lead:', error)
    return { success: false, error }
  }
}

// Search Google Maps via Serper.dev
async function searchGoogleMaps(query: string, location: string): Promise<SerperPlace[]> {
  if (!SERPER_API_KEY) {
    console.log('⚠️ Serper API not configured, using demo data')
    return []
  }

  try {
    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${query} near ${location}`,
        location: location,
        gl: 'us',
        hl: 'en'
      })
    })

    if (!response.ok) {
      console.error('Serper API error:', response.status)
      return []
    }

    const data = await response.json()

    // Extract places from response
    const places: SerperPlace[] = (data.places || []).map((place: any) => ({
      title: place.title,
      address: place.address,
      rating: place.rating,
      ratingCount: place.ratingCount,
      phoneNumber: place.phoneNumber,
      website: place.website,
      category: place.category
    }))

    return places
  } catch (error) {
    console.error('Serper search error:', error)
    return []
  }
}

// Map specialty to Google Maps search terms
function getSearchTerms(specialty: string): string {
  const searchTermMap: Record<string, string> = {
    "Physical Therapy": "physical therapy clinic",
    "Orthopedic Surgery": "orthopedic surgeon",
    "Primary Care": "primary care doctor",
    "Chiropractic": "chiropractor",
    "Pain Management": "pain management doctor",
    "Sports Medicine": "sports medicine doctor",
    "Neurology": "neurologist",
    "Cardiology": "cardiologist",
    "Dermatology": "dermatologist",
    "Dentist": "dentist",
    "Oral Surgery": "oral surgeon",
    "Orthodontist": "orthodontist",
    "Mental Health": "therapist mental health",
    "Psychiatry": "psychiatrist",
    "Psychology": "psychologist",
    "Counseling": "counselor therapist",
    "Gastroenterology": "gastroenterologist",
    "Imaging Center": "imaging center MRI",
    "Urgent Care": "urgent care clinic",
    "OB/GYN": "obgyn gynecologist",
    "ENT": "ENT doctor",
    "Podiatry": "podiatrist",
    "Optometry": "optometrist",
    "Ophthalmology": "ophthalmologist",
    "Endocrinology": "endocrinologist",
    "Pulmonology": "pulmonologist",
    "Rheumatology": "rheumatologist",
    "Oncology": "oncologist",
    "Urology": "urologist",
    "Allergy/Immunology": "allergist",
    "Acupuncture": "acupuncture clinic",
    "Massage Therapy": "massage therapist",
    "Nutrition": "nutritionist dietitian",
    "Med Spa": "medical spa",
  }

  return searchTermMap[specialty] || specialty.toLowerCase()
}

// Generate demo data as fallback
function generateDemoSource(specialty: string, location: string, index: number): ReferralSource {
  const demoNames: Record<string, string[]> = {
    "Physical Therapy": ["Athlete Restoration Co", "Lifemotion Physical Therapy", "Palm Beach Sports Rehab", "PhysioCare Jupiter"],
    "Orthopedic Surgery": ["Palm Beach Orthopaedic Institute", "Personalized Orthopedics of the Palm Beaches", "Atlantis Orthopaedics", "The Center for Bone & Joint"],
    "Primary Care": ["Palm Beach Family Practice", "Gardens Primary Care", "Coastal Internal Medicine", "Jupiter Medical Associates"],
    "Chiropractic": ["Paramount Chiropractic", "PGA Chiropractic Health Center", "Papa Chiropractic & PT", "Simply Chiropractic"],
    "Pain Management": ["Certified Spine & Pain Care", "APM Wellness", "Palm Beach Pain Institute", "Cantor Spine Center"],
    "Dermatology": ["Gardens Dermatology", "Frieder Dermatology", "Water's Edge Dermatology", "Palm Beach Dermatology"],
    "Dentist": ["Natural Smile Dentistry", "Ritter & Ramsey Dentistry", "PGA Dentistry", "Intercoastal Dental"],
    "Orthodontist": ["Palm Beach Orthodontics", "Gardens Orthodontic Associates", "Smile Design Orthodontics"],
    "Oral Surgery": ["South Florida Oral Surgery", "Palm Beach Oral & Facial Surgery", "Jupiter Oral Surgery Center"],
    "Med Spa": ["New Radiance Cosmetic Centers", "Opulence Medical Spa", "GaliDerm Aesthetics", "MD Beauty Labs"],
    "Imaging Center": ["Palm Beach Radiology", "Gardens Imaging Center", "Precision MRI Palm Beach"],
    "Massage Therapy": ["Healing Hands Massage PBG", "Palm Beach Therapeutic Massage", "Jupiter Bodywork"],
    "Sports Medicine": ["Palm Beach Sports Medicine", "Jupiter Sports Medicine", "Gardens Sports & Spine"],
    "Psychology": ["Palm Beach Psychological Associates", "Gardens Behavioral Health", "Coastal Psychology Center"],
    "Psychiatry": ["Palm Beach Psychiatry Associates", "Gardens Mental Health Center", "Coastal Psychiatry"],
    "Counseling": ["Palm Beach Counseling Center", "Gardens Family Counseling", "Hope Counseling PBG"],
    default: ["Palm Beach Health Associates", "Gardens Medical Specialists", "Jupiter Care Center"]
  }

  const demoAddresses = [
    "3385 Burns Rd, Palm Beach Gardens, FL",
    "11201 N Military Trail, Palm Beach Gardens, FL",
    "4060 PGA Blvd, Palm Beach Gardens, FL",
    "275 Toney Penna Dr, Jupiter, FL",
    "1210 S Old Dixie Hwy, Jupiter, FL",
    "9100 Belvedere Rd, Royal Palm Beach, FL",
    "2401 PGA Blvd, Palm Beach Gardens, FL",
    "10800 N Military Trail, Palm Beach Gardens, FL",
    "4600 Military Trail, Jupiter, FL",
    "625 N Flagler Dr, West Palm Beach, FL",
    "1411 N Flagler Dr, West Palm Beach, FL",
    "3401 PGA Blvd, Palm Beach Gardens, FL",
  ]

  const names = demoNames[specialty] || demoNames.default
  const name = names[index % names.length]
  const address = demoAddresses[index % demoAddresses.length]
  const areaCode = "561"
  const phoneNum = `${200 + Math.floor(Math.random() * 800)}-${1000 + Math.floor(Math.random() * 9000)}`

  return {
    name,
    specialty,
    address: address || `${location}`,
    distance: `${(1 + Math.random() * 8).toFixed(1)} mi`,
    rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
    reviewCount: 15 + Math.floor(Math.random() * 250),
    website: null, // Demo data — no real website, prevents viral outreach
    phone: `(${areaCode}) ${phoneNum}`,
    fitScore: 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { specialty, location, email, practiceName } = body

    if (!specialty || !location || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get adjacent specialties that would refer to this specialty
    const adjacentSpecialties = getAdjacentSpecialties(specialty)

    if (adjacentSpecialties.length === 0) {
      return NextResponse.json(
        { error: "No adjacent specialties found for this specialty" },
        { status: 400 }
      )
    }

    const sources: ReferralSource[] = []
    const useSerper = !!SERPER_API_KEY

    console.log(`🔍 Generating snapshot for ${specialty} in ${location} (Serper: ${useSerper ? 'enabled' : 'disabled'})`)

    // Search for each adjacent specialty (limit to top 4 to conserve API calls)
    for (const adjSpecialty of adjacentSpecialties.slice(0, 4)) {
      let foundPlaces = false

      if (useSerper) {
        // Use real Google Maps data via Serper
        const searchTerm = getSearchTerms(adjSpecialty)
        const places = await searchGoogleMaps(searchTerm, location)

        if (places.length > 0) {
          foundPlaces = true
          for (const place of places.slice(0, 4)) {
            sources.push({
              name: place.title,
              specialty: adjSpecialty,
              address: place.address || 'Address not available',
              distance: "Nearby",
              rating: place.rating || 4.0,
              reviewCount: place.ratingCount || 0,
              website: place.website || null,
              phone: place.phoneNumber || null,
              fitScore: calculateFitScore(specialty, adjSpecialty)
            })
          }
        }
      }

      // Fallback to demo data if Serper not configured, failed, or returned empty
      if (!foundPlaces) {
        for (let i = 0; i < 3; i++) {
          const source = generateDemoSource(adjSpecialty, location, sources.length)
          source.fitScore = calculateFitScore(specialty, adjSpecialty)
          sources.push(source)
        }
      }

      // Stop if we have enough
      if (sources.length >= 15) break
    }

    // Sort by fit score descending
    sources.sort((a, b) => b.fitScore - a.fitScore)

    // Calculate summary stats
    const avgFitScore = sources.length > 0
      ? Math.round(sources.reduce((sum, s) => sum + s.fitScore, 0) / sources.length)
      : 0

    // Find top specialty by count
    const specialtyCounts: Record<string, number> = {}
    sources.forEach(s => {
      specialtyCounts[s.specialty] = (specialtyCounts[s.specialty] || 0) + 1
    })
    const topSpecialty = Object.entries(specialtyCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || adjacentSpecialties[0]

    const snapshotData = {
      specialty,
      location,
      practiceName: practiceName || "",
      email,
      sources,
      summary: {
        totalSources: sources.length,
        avgFitScore,
        topSpecialty,
        radiusMiles: 10
      }
    }

    // Store lead in Airtable
    await storeSnapshotLead({
      email,
      specialty,
      location,
      practiceName: practiceName || "",
      sourcesCount: sources.length,
      avgFitScore
    })

    // Send automated emails (non-blocking)
    const firstName = (practiceName || email.split("@")[0]).split(" ")[0]
    sendSnapshotEmail(email, firstName, specialty, location, sources.length, topSpecialty).catch(() => {})
    sendLeadNotification(email, practiceName || "", specialty, location, sources.length).catch(() => {})

    // Viral outreach: email found providers telling them someone nearby wants to refer to them
    // Only email top 3 highest-fit providers to avoid spam
    for (const source of sources.slice(0, 3)) {
      if (source.website) {
        sendViralOutreach(
          { name: source.name, specialty: source.specialty, address: source.address, website: source.website, phone: source.phone },
          specialty,
          location
        ).catch(() => {})
      }
    }

    console.log(`📊 Snapshot generated: ${sources.length} sources for ${email}`)

    return NextResponse.json(snapshotData)
  } catch (error) {
    console.error("Snapshot generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate snapshot" },
      { status: 500 }
    )
  }
}
