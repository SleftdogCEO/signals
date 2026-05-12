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
          coordinates
        })
      }
    } catch (error) {
      console.error('Error searching for partners:', error)
    }
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

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
    const userLocation = currentProvider.location || ''

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

      if (userSpecialty.includes('primary') || userSpecialty.includes('family') || userSpecialty.includes('internal medicine')) {
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

    // Search for real local partners using Serper
    let matches = await searchLocalPartners(userLocation, searchTerms)

    // Filter out same specialty (competitors)
    matches = matches.filter(m =>
      m.specialty.toLowerCase() !== currentProvider.specialty.toLowerCase()
    )

    // Sort by match score
    matches.sort((a, b) => b.match_score - a.match_score)

    // Limit results
    matches = matches.slice(0, 12)

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

    // Geocode the user's location for map centering
    const centerCoordinates = await geocodeAddress(userLocation)

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
      center_coordinates: centerCoordinates
    })
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
