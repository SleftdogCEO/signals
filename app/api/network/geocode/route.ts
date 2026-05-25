import { NextRequest, NextResponse } from 'next/server'

// Geocode a practice address to coordinates for accurate map centering and
// distance math. Tries Google first (most accurate for exact street addresses,
// using the existing Maps key), then free fallbacks (US Census, OSM Nominatim),
// and finally the ZIP centroid so we never return null when a ZIP is present.
// The resulting lat/lng is stored privately on the provider row; it is never
// exposed in the public directory.

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Most accurate: Google geocoding resolves exact street addresses (including
// newer subdivisions the free geocoders miss).
async function geocodeGoogle(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_MAPS_API_KEY) return null
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
    return null
  } catch {
    return null
  }
}

// Forward-geocode a US street address via the free US Census geocoder. Best for
// full street addresses; returns null for bare cities/ZIPs.
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
  } catch {
    return null
  }
}

// Fallback: OSM Nominatim. Handles addresses the Census geocoder misses (e.g.
// suite-only or newer addresses) and also resolves bare cities/ZIPs.
async function geocodeNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', USA')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'SleftSignals/1.0 (referral-network)' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    return null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = (searchParams.get('address') || '').trim()
  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  }

  // ZIP centroid fallback: use the LAST 5-digit token (the ZIP usually trails
  // the address; the first 5-digit run could be a house number).
  const zips = address.match(/\b\d{5}\b/g)
  const zip = zips && zips.length ? zips[zips.length - 1] : null

  const coords =
    (await geocodeGoogle(address)) ||
    (await geocodeCensus(address)) ||
    (await geocodeNominatim(address)) ||
    (zip ? await geocodeNominatim(zip) : null)

  if (!coords) {
    return NextResponse.json({ coordinates: null }, { status: 200 })
  }
  return NextResponse.json({ coordinates: coords }, { status: 200 })
}
