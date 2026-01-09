import { NextRequest, NextResponse } from "next/server"
import { getAdjacentSpecialties, calculateFitScore } from "@/lib/adjacency-map"

const SERPER_API_KEY = process.env.SERPER_API_KEY

interface SerperPlace {
  title: string
  address: string
  rating?: number
  ratingCount?: number
  phoneNumber?: string
  website?: string
  category?: string
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

// Search Google Maps via Serper.dev
async function searchGoogleMaps(query: string, location: string): Promise<SerperPlace[]> {
  if (!SERPER_API_KEY) {
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
      return []
    }

    const data = await response.json()
    return (data.places || []).map((place: any) => ({
      title: place.title,
      address: place.address,
      rating: place.rating,
      ratingCount: place.ratingCount,
      phoneNumber: place.phoneNumber,
      website: place.website,
      category: place.category
    }))
  } catch (error) {
    console.error('Serper search error:', error)
    return []
  }
}

// Demo data for testing when no API key
function getDemoSources(specialty: string, location: string): ReferralSource[] {
  const demoData: Record<string, ReferralSource[]> = {
    "Dentist": [
      { name: "Miami Orthodontics & Braces", specialty: "Orthodontist", address: "1234 Brickell Ave, Miami, FL 33131", distance: "0.8 miles", rating: 4.9, reviewCount: 234, website: "https://example.com", phone: "(305) 555-0101", fitScore: 95 },
      { name: "Coral Gables Oral Surgery", specialty: "Oral Surgery", address: "456 Miracle Mile, Coral Gables, FL 33134", distance: "2.1 miles", rating: 4.7, reviewCount: 156, website: "https://example.com", phone: "(305) 555-0102", fitScore: 92 },
      { name: "South Beach Periodontics", specialty: "Periodontist", address: "789 Ocean Dr, Miami Beach, FL 33139", distance: "3.4 miles", rating: 4.8, reviewCount: 89, website: "https://example.com", phone: "(305) 555-0103", fitScore: 90 },
      { name: "Downtown Miami Pediatric Dentistry", specialty: "Pediatric Dentist", address: "321 Flagler St, Miami, FL 33130", distance: "1.2 miles", rating: 4.6, reviewCount: 312, website: "https://example.com", phone: "(305) 555-0104", fitScore: 88 },
      { name: "Kendall Family Medicine", specialty: "Family Medicine", address: "8901 SW 107th Ave, Miami, FL 33176", distance: "8.5 miles", rating: 4.5, reviewCount: 445, website: "https://example.com", phone: "(305) 555-0105", fitScore: 85 },
      { name: "Aventura ENT Specialists", specialty: "ENT", address: "2999 NE 191st St, Aventura, FL 33180", distance: "12.3 miles", rating: 4.7, reviewCount: 178, website: "https://example.com", phone: "(305) 555-0106", fitScore: 82 },
    ],
    "Chiropractor": [
      { name: "Miami Physical Therapy Center", specialty: "Physical Therapy", address: "1500 NW 12th Ave, Miami, FL 33136", distance: "1.5 miles", rating: 4.8, reviewCount: 267, website: "https://example.com", phone: "(305) 555-0201", fitScore: 96 },
      { name: "Brickell Sports Medicine", specialty: "Sports Medicine", address: "1001 Brickell Bay Dr, Miami, FL 33131", distance: "0.9 miles", rating: 4.9, reviewCount: 189, website: "https://example.com", phone: "(305) 555-0202", fitScore: 94 },
      { name: "South Florida Pain Management", specialty: "Pain Management", address: "7800 SW 87th Ave, Miami, FL 33173", distance: "6.2 miles", rating: 4.6, reviewCount: 134, website: "https://example.com", phone: "(305) 555-0203", fitScore: 91 },
      { name: "Miami Orthopedic Associates", specialty: "Orthopedic", address: "3661 S Miami Ave, Miami, FL 33133", distance: "2.8 miles", rating: 4.7, reviewCount: 456, website: "https://example.com", phone: "(305) 555-0204", fitScore: 89 },
      { name: "Holistic Massage & Wellness", specialty: "Massage Therapy", address: "2020 Salzedo St, Coral Gables, FL 33134", distance: "3.1 miles", rating: 4.9, reviewCount: 523, website: "https://example.com", phone: "(305) 555-0205", fitScore: 87 },
      { name: "Doral Acupuncture Clinic", specialty: "Acupuncture", address: "8200 NW 36th St, Doral, FL 33166", distance: "9.4 miles", rating: 4.5, reviewCount: 78, website: "https://example.com", phone: "(305) 555-0206", fitScore: 84 },
    ],
    "default": [
      { name: "Premier Family Medicine", specialty: "Family Medicine", address: "123 Main St, Miami, FL 33101", distance: "1.0 miles", rating: 4.7, reviewCount: 234, website: "https://example.com", phone: "(305) 555-0301", fitScore: 90 },
      { name: "Internal Medicine Associates", specialty: "Internal Medicine", address: "456 Health Blvd, Miami, FL 33102", distance: "2.5 miles", rating: 4.6, reviewCount: 189, website: "https://example.com", phone: "(305) 555-0302", fitScore: 88 },
      { name: "Community Health Partners", specialty: "Primary Care", address: "789 Wellness Way, Miami, FL 33103", distance: "3.2 miles", rating: 4.8, reviewCount: 312, website: "https://example.com", phone: "(305) 555-0303", fitScore: 86 },
      { name: "Specialty Care Network", specialty: "Multi-Specialty", address: "321 Medical Center Dr, Miami, FL 33104", distance: "4.1 miles", rating: 4.5, reviewCount: 156, website: "https://example.com", phone: "(305) 555-0304", fitScore: 84 },
    ]
  }

  return demoData[specialty] || demoData["default"]
}

// Map specialty to search terms
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
  }
  return searchTermMap[specialty] || specialty.toLowerCase()
}

// Decode brief ID to get parameters
function decodeBriefId(id: string): { specialty: string; location: string; practiceName: string } | null {
  try {
    const decoded = Buffer.from(id, 'base64url').toString('utf8')
    const [specialty, location, practiceName] = decoded.split('|')
    if (!specialty || !location) return null
    return { specialty, location, practiceName: practiceName || '' }
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Decode the brief ID
    const briefParams = decodeBriefId(id)
    if (!briefParams) {
      return NextResponse.json(
        { error: "Invalid brief ID" },
        { status: 400 }
      )
    }

    const { specialty, location, practiceName } = briefParams

    // Get adjacent specialties
    const adjacentSpecialties = getAdjacentSpecialties(specialty)
    if (adjacentSpecialties.length === 0) {
      return NextResponse.json(
        { error: "No referral partners found for this specialty" },
        { status: 400 }
      )
    }

    const sources: ReferralSource[] = []
    const useSerper = !!SERPER_API_KEY

    console.log(`🔍 Loading brief for ${practiceName || specialty} in ${location}`)

    // Search for each adjacent specialty
    for (const adjSpecialty of adjacentSpecialties.slice(0, 4)) {
      if (useSerper) {
        const searchTerm = getSearchTerms(adjSpecialty)
        const places = await searchGoogleMaps(searchTerm, location)

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

      if (sources.length >= 15) break
    }

    // Fall back to demo data if no results
    if (sources.length === 0) {
      console.log(`📋 Using demo data for ${specialty}`)
      sources.push(...getDemoSources(specialty, location))
    }

    // Sort by fit score
    sources.sort((a, b) => b.fitScore - a.fitScore)

    // Calculate stats
    const avgFitScore = sources.length > 0
      ? Math.round(sources.reduce((sum, s) => sum + s.fitScore, 0) / sources.length)
      : 0

    const specialtyCounts: Record<string, number> = {}
    sources.forEach(s => {
      specialtyCounts[s.specialty] = (specialtyCounts[s.specialty] || 0) + 1
    })
    const topSpecialty = Object.entries(specialtyCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || adjacentSpecialties[0]

    return NextResponse.json({
      specialty,
      location,
      practiceName,
      sources,
      summary: {
        totalSources: sources.length,
        avgFitScore,
        topSpecialty,
        radiusMiles: 10
      }
    })
  } catch (error) {
    console.error("Brief loading error:", error)
    return NextResponse.json(
      { error: "Failed to load brief" },
      { status: 500 }
    )
  }
}
