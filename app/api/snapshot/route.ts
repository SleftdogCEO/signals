import { NextRequest, NextResponse } from "next/server"
import { getAdjacentSpecialties, calculateFitScore } from "@/lib/adjacency-map"

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

interface SnapshotRequest {
  specialty: string
  location: string
  practiceName?: string
  email: string
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

// Demo practice name generators by specialty
const PRACTICE_NAMES: Record<string, string[]> = {
  "Physical Therapy": ["Peak Performance PT", "Movement Matters Therapy", "Active Life Physical Therapy", "Restore PT & Wellness"],
  "Orthopedic Surgery": ["Summit Orthopedics", "Precision Bone & Joint", "Advanced Ortho Specialists", "Metro Orthopedic Center"],
  "Primary Care": ["Family Health Partners", "Community Care Clinic", "Wellness First Medical", "Neighborhood Health Center"],
  "Chiropractic": ["Spine & Wellness Center", "Back to Health Chiropractic", "Align Chiropractic Care", "Peak Chiropractic"],
  "Pain Management": ["Pain Relief Specialists", "Comfort Care Pain Clinic", "Advanced Pain Solutions", "Integrated Pain Management"],
  "Sports Medicine": ["Athletic Edge Sports Med", "Peak Performance Sports", "Pro Sports Medicine", "Active Sports Health"],
  "Imaging Center": ["Premier Imaging", "Advanced Diagnostic Imaging", "ClearView Radiology", "Metro Imaging Center"],
  "Neurology": ["Brain & Spine Neurology", "Advanced Neuro Associates", "Neural Health Specialists", "Metro Neuroscience"],
  "Cardiology": ["Heart Health Specialists", "Advanced Cardiology Group", "Cardiovascular Care Center", "Metro Heart Clinic"],
  "Gastroenterology": ["Digestive Health Center", "GI Specialists of Metro", "Advanced Gastro Care", "Gut Health Associates"],
  "Dermatology": ["Clear Skin Dermatology", "Advanced Derm Associates", "Skin Health Center", "Metro Dermatology"],
  "Mental Health": ["Mind Matters Therapy", "Wellness Mental Health", "Balanced Mind Counseling", "Hope Psychiatric Services"],
  "Psychiatry": ["Clarity Psychiatry", "Mental Wellness Associates", "Behavioral Health Partners", "Mind Care Psychiatry"],
  "Psychology": ["Insight Psychology", "Clear Mind Counseling", "Behavioral Wellness Center", "Growth Psychology Group"],
  "Counseling": ["Hope Counseling Center", "Pathway Counseling", "New Horizons Therapy", "Clarity Counseling"],
  "Dentist": ["Bright Smile Dental", "Family Dental Care", "Premier Dentistry", "Comfort Dental Group"],
  "Oral Surgery": ["Metro Oral Surgery", "Advanced Oral & Maxillofacial", "Precision Oral Surgery", "Smile Surgery Center"],
  "Orthodontist": ["Perfect Smile Orthodontics", "Align Orthodontic Care", "Braces & Beyond", "Metro Orthodontics"],
  default: ["Metro Health Center", "Advanced Care Specialists", "Premier Medical Group", "Community Health Partners"]
}

// Street name components for realistic addresses
const STREET_NAMES = ["Oak", "Main", "Elm", "Park", "Medical Center", "Healthcare", "Professional", "Commerce", "Valley", "Ridge"]
const STREET_TYPES = ["Dr", "Blvd", "Ave", "Way", "Pkwy", "St"]

function generatePracticeName(specialty: string, index: number): string {
  const names = PRACTICE_NAMES[specialty] || PRACTICE_NAMES.default
  // Cycle through names and add suffixes for variety
  const baseName = names[index % names.length]
  if (index >= names.length) {
    const suffixes = ["Group", "Associates", "Partners", "Clinic", "Center"]
    return `${baseName.split(" ")[0]} ${suffixes[index % suffixes.length]}`
  }
  return baseName
}

function generateAddress(location: string, index: number): string {
  const streetNum = 100 + (index * 127) % 9900
  const streetName = STREET_NAMES[index % STREET_NAMES.length]
  const streetType = STREET_TYPES[index % STREET_TYPES.length]
  const suite = index % 3 === 0 ? `, Suite ${100 + (index * 17) % 400}` : ""
  return `${streetNum} ${streetName} ${streetType}${suite}, ${location}`
}

function generateDistance(index: number): string {
  // Generate distances from 0.3 to 8 miles
  const miles = 0.3 + (index * 0.7) + Math.random() * 0.5
  return `${miles.toFixed(1)} mi`
}

function generateRating(): number {
  // Generate ratings between 3.8 and 5.0
  return Math.round((3.8 + Math.random() * 1.2) * 10) / 10
}

function generateReviewCount(): number {
  // Generate review counts between 15 and 500
  return 15 + Math.floor(Math.random() * 485)
}

function generatePhone(): string {
  const areaCode = ["512", "737", "832", "713", "214", "469", "972"][Math.floor(Math.random() * 7)]
  const prefix = 200 + Math.floor(Math.random() * 800)
  const line = 1000 + Math.floor(Math.random() * 9000)
  return `(${areaCode}) ${prefix}-${line}`
}

function generateWebsite(practiceName: string): string {
  const slug = practiceName.toLowerCase().replace(/[^a-z0-9]+/g, "")
  return `https://${slug}.com`
}

export async function POST(request: NextRequest) {
  try {
    const body: SnapshotRequest = await request.json()
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

    // Generate demo referral sources
    // In production, this would call Google Places API
    const sources: ReferralSource[] = []
    let sourceIndex = 0

    // Generate 2-4 practices per adjacent specialty, up to 15-20 total
    for (const adjSpecialty of adjacentSpecialties) {
      const count = 2 + Math.floor(Math.random() * 3) // 2-4 per specialty

      for (let i = 0; i < count && sources.length < 18; i++) {
        const name = generatePracticeName(adjSpecialty, sourceIndex)
        sources.push({
          name,
          specialty: adjSpecialty,
          address: generateAddress(location, sourceIndex),
          distance: generateDistance(sourceIndex),
          rating: generateRating(),
          reviewCount: generateReviewCount(),
          website: generateWebsite(name),
          phone: generatePhone(),
          fitScore: calculateFitScore(specialty, adjSpecialty)
        })
        sourceIndex++
      }
    }

    // Sort by fit score descending, then by distance
    sources.sort((a, b) => {
      if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore
      return parseFloat(a.distance) - parseFloat(b.distance)
    })

    // Calculate summary stats
    const avgFitScore = Math.round(
      sources.reduce((sum, s) => sum + s.fitScore, 0) / sources.length
    )

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

    console.log(`📊 Snapshot generated for ${email} - ${specialty} in ${location}`)

    return NextResponse.json(snapshotData)
  } catch (error) {
    console.error("Snapshot generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate snapshot" },
      { status: 500 }
    )
  }
}
