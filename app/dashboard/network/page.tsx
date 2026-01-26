"use client"

import { useEffect, useState, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Lock,
  Sparkles,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  Crown,
  Zap,
  Building,
  Shield,
  Star,
  MessageSquare,
  Lightbulb,
  Map as MapIcon,
  List,
  X
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

const mapContainerStyle = {
  width: "100%",
  height: "100%"
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e3a2f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] }
]

interface MatchedProvider {
  id: string
  practice_name: string
  specialty: string
  location: string
  bio: string | null
  email: string | null
  phone: string | null
  website: string | null
  match_score: number
  why_match: string[]
  is_verified: boolean
  coordinates?: { lat: number; lng: number }
}

interface DiscoverResponse {
  matches: MatchedProvider[]
  total: number
  subscription_status: string
  is_subscribed: boolean
  is_trialing: boolean
  trial_ends_at: string | null
  current_provider: {
    id: string
    practice_name: string
    specialty: string
    location: string
  }
  center_coordinates?: { lat: number; lng: number }
}

interface NetworkMapProps {
  matches: MatchedProvider[]
  centerCoordinates?: { lat: number; lng: number }
  canSeeDetails: boolean
  accents: { bg: string; light: string }[]
}

function NetworkMap({ matches, centerCoordinates, canSeeDetails, accents }: NetworkMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  })

  const [selectedProvider, setSelectedProvider] = useState<MatchedProvider | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const center = centerCoordinates || { lat: 39.8283, lng: -98.5795 }

  const matchesWithCoords = matches.filter((m) => m.coordinates)

  // Fit map bounds to show all markers
  useEffect(() => {
    if (map && matchesWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      matchesWithCoords.forEach((match) => {
        if (match.coordinates) {
          bounds.extend({ lat: match.coordinates.lat, lng: match.coordinates.lng })
        }
      })
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })

      // Don't zoom in too much if markers are close together
      const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const currentZoom = map.getZoom()
        if (currentZoom && currentZoom > 14) {
          map.setZoom(14)
        }
      })
    }
  }, [map, matchesWithCoords])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-700 bg-slate-800/50 p-12 text-center mb-8"
      >
        <MapIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Map View Coming Soon</h3>
        <p className="text-slate-400">
          The interactive map is being configured. Please use list view for now.
        </p>
      </motion.div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 h-[600px] flex items-center justify-center mb-8">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl overflow-hidden border border-slate-700 mb-8"
      style={{ height: "600px" }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={(mapInstance) => setMap(mapInstance)}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {matchesWithCoords.map((match, index) => (
          <Marker
            key={match.id}
            position={{ lat: match.coordinates!.lat, lng: match.coordinates!.lng }}
            onClick={() => setSelectedProvider(match)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: index % 6 === 0 ? "#3b82f6" : index % 6 === 1 ? "#8b5cf6" : index % 6 === 2 ? "#10b981" : index % 6 === 3 ? "#f43f5e" : index % 6 === 4 ? "#f59e0b" : "#6366f1",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3
            }}
          />
        ))}

        {selectedProvider && selectedProvider.coordinates && (
          <InfoWindow
            position={{ lat: selectedProvider.coordinates.lat, lng: selectedProvider.coordinates.lng }}
            onCloseClick={() => setSelectedProvider(null)}
          >
            <div className="bg-slate-800 rounded-xl p-4 min-w-[280px]">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-white">
                  {selectedProvider.practice_name}
                </h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 mb-3">
                {selectedProvider.specialty}
              </span>

              <div className="flex items-center gap-2 mb-3 text-slate-300 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                {selectedProvider.location}
              </div>

              {canSeeDetails ? (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  {selectedProvider.email && (
                    <a
                      href={`mailto:${selectedProvider.email}`}
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400"
                    >
                      <Mail className="w-4 h-4" />
                      {selectedProvider.email}
                    </a>
                  )}
                  {selectedProvider.phone && (
                    <a
                      href={`tel:${selectedProvider.phone}`}
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedProvider.phone}
                    </a>
                  )}
                  {selectedProvider.website && (
                    <a
                      href={selectedProvider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-violet-400"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-700">
                  <Link
                    href="/dashboard/network/upgrade"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600"
                  >
                    <Lock className="w-4 h-4" />
                    Unlock Contact Info
                  </Link>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </motion.div>
  )
}

function NetworkPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<DiscoverResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "map">("list")

  // Check for success from Stripe checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Welcome to the Partner Network!')
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/dashboard/network")
      return
    }

    if (user) {
      loadMatches()
    }
  }, [user, authLoading, router])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/network/discover?userId=${user?.id}`)

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 404) {
          // No provider profile - redirect to onboarding
          router.push("/onboarding")
          return
        }
        throw new Error(errorData.error || "Failed to load matches")
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error loading matches:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      window.location.href = url
    } catch (err) {
      toast.error('Failed to open subscription management')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Users className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Finding Your Matches</h2>
            <p className="text-slate-400">Looking for two-way referral partners...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-slate-400 mb-6">{error || "Something went wrong"}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const canSeeDetails = data.is_subscribed || data.is_trialing
  const trialDaysLeft = data.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  // Accent colors for cards
  const accents = [
    { bg: 'from-blue-500 to-cyan-400', light: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { bg: 'from-violet-500 to-purple-400', light: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { bg: 'from-emerald-500 to-teal-400', light: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { bg: 'from-rose-500 to-pink-400', light: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { bg: 'from-amber-500 to-orange-400', light: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { bg: 'from-indigo-500 to-blue-400', light: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Sleft Health</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/network/hub"
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm font-medium rounded-lg hover:bg-violet-500/30 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Intelligence Hub
            </Link>
            {data.is_subscribed && (
              <button
                onClick={handleManageSubscription}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            {data.is_subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <Crown className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-semibold">Network Member</span>
              </div>
            ) : data.is_trialing ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-semibold">Trial - {trialDaysLeft} days left</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-full">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400 font-semibold">Upgrade to Connect</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Local Providers Who Want to Send You Patients
          </h1>
          <p className="text-xl text-slate-400 mb-4">
            <span className="text-emerald-400 font-bold">{data.total} healthcare providers</span> near {data.current_provider.location} have joined the network
            and want to exchange referrals with <span className="font-semibold text-white">{data.current_provider.specialty}</span> practices like yours.
          </p>
          <p className="text-lg text-slate-500">
            These aren't cold leads. These are real providers who opted in to partner with you.
          </p>
        </motion.div>

        {/* Upgrade Banner for non-subscribers */}
        {!canSeeDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 rounded-2xl p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Connect With These Providers</h2>
                  <p className="text-white/80">{data.total} local practices ready to partner with you</p>
                </div>
              </div>
              <p className="text-white/90 mb-6 max-w-xl">
                These healthcare providers in <strong>{data.current_provider.location}</strong> have joined the network specifically to
                find referral partners. They want to send patients to <strong>{data.current_provider.specialty}</strong> practices like yours,
                and they're looking for someone to send their patients to as well.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard/network/upgrade"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-xl text-lg"
                >
                  <Zap className="w-5 h-5" />
                  Join the Network - $50/month
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {data.total === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Matches Yet</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              We couldn't find two-way matches in your area. As more providers join,
              you'll be notified when matches appear.
            </p>
          </motion.div>
        )}

        {/* View Toggle */}
        {data.total > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              Showing {data.matches.length} providers
            </p>
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>
        )}

        {/* Map View */}
        {data.total > 0 && viewMode === "map" && (
          <NetworkMap
            matches={data.matches}
            centerCoordinates={data.center_coordinates}
            canSeeDetails={canSeeDetails}
            accents={accents}
          />
        )}

        {/* Matches Grid */}
        {data.total > 0 && viewMode === "list" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {data.matches.map((match, index) => {
              const accent = accents[index % accents.length]

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.25 + index * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${accent.bg} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500`} />

                  <div className={`relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group-hover:border-slate-600 transition-all duration-300 ${!canSeeDetails ? 'select-none' : ''}`}>
                    {/* Accent bar */}
                    <div className={`h-2 bg-gradient-to-r ${accent.bg}`} />

                    <div className="p-5">
                      {/* Header with Match Score */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                            {match.practice_name}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${accent.light}`}>
                            {match.specialty}
                          </span>
                        </div>

                        {/* Match Score */}
                        <div className="flex-shrink-0 text-center">
                          <div className={`w-14 h-14 bg-gradient-to-br ${accent.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                            <span className="text-xl font-black text-white">{match.match_score}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 block">match</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 mb-4 p-3 bg-slate-700/50 rounded-xl">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <p className="text-sm text-slate-300 font-medium">{match.location}</p>
                      </div>

                      {/* Why you match */}
                      <div className="mb-4 p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-bold text-white">Why You Match</span>
                        </div>
                        <ul className="space-y-1">
                          {match.why_match.slice(0, 2).map((reason, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Contact Info - Blurred for non-subscribers */}
                      {canSeeDetails ? (
                        <div className="space-y-2">
                          {match.email && (
                            <a
                              href={`mailto:${match.email}`}
                              className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                              <Mail className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-slate-300">{match.email}</span>
                            </a>
                          )}
                          {match.phone && (
                            <a
                              href={`tel:${match.phone}`}
                              className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                              <Phone className="w-4 h-4 text-emerald-400" />
                              <span className="text-sm text-slate-300">{match.phone}</span>
                            </a>
                          )}
                          {match.website && (
                            <a
                              href={match.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                              <Globe className="w-4 h-4 text-violet-400" />
                              <span className="text-sm text-slate-300 truncate">{match.website}</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="space-y-2 filter blur-sm pointer-events-none">
                            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl">
                              <Mail className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-slate-300">contact@example.com</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl">
                              <Phone className="w-4 h-4 text-emerald-400" />
                              <span className="text-sm text-slate-300">(555) 123-4567</span>
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-xl">
                            <Link
                              href="/dashboard/network/upgrade"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Lock className="w-4 h-4" />
                              Unlock Contact
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default function NetworkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Users className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Network</h2>
            <p className="text-slate-400">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <NetworkPageContent />
    </Suspense>
  )
}
