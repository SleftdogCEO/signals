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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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
