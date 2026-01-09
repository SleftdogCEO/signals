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
}

// Category mapping for search queries
const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  'primary_care': ['family medicine clinic', 'primary care doctor', 'internal medicine practice', 'pediatrician office'],
  'specialists': ['cardiologist', 'dermatologist', 'orthopedic surgeon', 'gastroenterologist'],
  'mental_health': ['psychiatrist', 'psychologist office', 'mental health counselor', 'therapy practice'],
  'physical_rehab': ['physical therapy clinic', 'chiropractor', 'sports medicine', 'occupational therapy'],
  'dental_vision': ['dentist office', 'orthodontist', 'optometrist', 'ophthalmologist'],
  'wellness_aesthetic': ['med spa', 'medical spa', 'functional medicine doctor', 'wellness clinic', 'aesthetic clinic']
}

// Map search results to specialties
function getSpecialtyFromCategory(category: string | undefined, searchTerm: string): string {
  if (!category) {
    // Infer from search term
    if (searchTerm.includes('physical therapy') || searchTerm.includes('PT')) return 'Physical Therapy'
    if (searchTerm.includes('chiropractor')) return 'Chiropractic'
    if (searchTerm.includes('dentist')) return 'Dentistry'
    if (searchTerm.includes('orthodontist')) return 'Orthodontics'
    if (searchTerm.includes('optometrist')) return 'Optometry'
    if (searchTerm.includes('psychiatrist')) return 'Psychiatry'
    if (searchTerm.includes('psychologist') || searchTerm.includes('therapy')) return 'Psychology'
    if (searchTerm.includes('med spa') || searchTerm.includes('medical spa')) return 'Med Spa'
    if (searchTerm.includes('cardiologist')) return 'Cardiology'
    if (searchTerm.includes('dermatologist')) return 'Dermatology'
    if (searchTerm.includes('orthopedic')) return 'Orthopedics'
    if (searchTerm.includes('family medicine') || searchTerm.includes('primary care')) return 'Primary Care'
    return 'Healthcare'
  }

  const categoryLower = category.toLowerCase()
  if (categoryLower.includes('physical therapy')) return 'Physical Therapy'
  if (categoryLower.includes('chiropractor')) return 'Chiropractic'
  if (categoryLower.includes('dentist') || categoryLower.includes('dental')) return 'Dentistry'
  if (categoryLower.includes('orthodontist')) return 'Orthodontics'
  if (categoryLower.includes('optometrist') || categoryLower.includes('optician')) return 'Optometry'
  if (categoryLower.includes('psychiatr')) return 'Psychiatry'
  if (categoryLower.includes('psycholog') || categoryLower.includes('counselor') || categoryLower.includes('therapist')) return 'Psychology'
  if (categoryLower.includes('spa') || categoryLower.includes('aesthetic')) return 'Med Spa'
  if (categoryLower.includes('cardiolog')) return 'Cardiology'
  if (categoryLower.includes('dermatolog')) return 'Dermatology'
  if (categoryLower.includes('orthopedic')) return 'Orthopedics'
  if (categoryLower.includes('family') || categoryLower.includes('primary') || categoryLower.includes('internal medicine')) return 'Primary Care'
  if (categoryLower.includes('pediatric')) return 'Pediatrics'
  return 'Healthcare'
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
          review_count: place.ratingCount
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

    // If no specific interests, search for general healthcare partners
    if (searchTerms.length === 0) {
      searchTerms.push('medical clinic', 'healthcare practice', 'doctor office')
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

    // If no access, hide contact info
    if (!hasAccess) {
      matches = matches.map(m => ({
        ...m,
        phone: undefined,
        website: undefined,
        address: m.address ? m.address.split(',').slice(-2).join(',').trim() : undefined // Show only city/state
      }))
    }

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
      }
    })
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
