"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, MapPin, Filter, Users, Star, Lock, ArrowRight, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { createClient } from "@supabase/supabase-js"
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Provider {
  id: string
  practice_name: string
  specialty: string
  location: string
  bio: string | null
  patients_i_want: string[]
  patients_i_refer: string[]
  subscription_status: string
  match_score?: number
}

// Demo providers for when the network is empty
const DEMO_PROVIDERS: Provider[] = [
  {
    id: "demo-1",
    practice_name: "Summit Orthopedic Surgery",
    specialty: "Orthopedic Surgery",
    location: "Austin, TX",
    bio: "Specializing in sports medicine and joint replacement. Looking for PT and chiro partners.",
    patients_i_want: ["Physical Therapy", "Chiropractic", "Primary Care"],
    patients_i_refer: ["Physical Therapy", "Pain Management", "Sports Medicine"],
    subscription_status: "active",
    match_score: 85
  },
  {
    id: "demo-2",
    practice_name: "Balanced Mind Counseling",
    specialty: "Counseling",
    location: "Austin, TX",
    bio: "Mental health services for adults. Great referral relationships with PCPs.",
    patients_i_want: ["Primary Care", "Psychiatry"],
    patients_i_refer: ["Psychiatry", "Primary Care"],
    subscription_status: "active",
    match_score: 72
  },
  {
    id: "demo-3",
    practice_name: "Premier Family Dentistry",
    specialty: "Dentistry",
    location: "Austin, TX",
    bio: "Full-service dental practice. Strong network with oral surgeons and orthodontists.",
    patients_i_want: ["Primary Care", "Pediatrics"],
    patients_i_refer: ["Orthodontics", "Oral Surgery", "Periodontics"],
    subscription_status: "active",
    match_score: 68
  },
  {
    id: "demo-4",
    practice_name: "Active Life Physical Therapy",
    specialty: "Physical Therapy",
    location: "Austin, TX",
    bio: "Sports rehab and post-surgical recovery. Looking for orthopedic surgeon partners.",
    patients_i_want: ["Orthopedic Surgery", "Sports Medicine", "Primary Care"],
    patients_i_refer: ["Orthopedic Surgery", "Pain Management", "Chiropractic"],
    subscription_status: "active",
    match_score: 92
  },
  {
    id: "demo-5",
    practice_name: "Central Texas Cardiology",
    specialty: "Cardiology",
    location: "Austin, TX",
    bio: "Comprehensive cardiac care. Strong referral network with primary care practices.",
    patients_i_want: ["Primary Care", "Internal Medicine", "Endocrinology"],
    patients_i_refer: ["Primary Care", "Cardiac Rehab"],
    subscription_status: "active",
    match_score: 65
  },
  {
    id: "demo-6",
    practice_name: "Spine & Wellness Chiropractic",
    specialty: "Chiropractic",
    location: "Austin, TX",
    bio: "Holistic spine care and wellness. Great partnerships with PTs and massage therapists.",
    patients_i_want: ["Primary Care", "Physical Therapy", "Orthopedic Surgery"],
    patients_i_refer: ["Physical Therapy", "Massage Therapy", "Acupuncture"],
    subscription_status: "active",
    match_score: 78
  }
]

const SPECIALTIES = [
  "All Specialties",
  "Primary Care",
  "Physical Therapy",
  "Orthopedic Surgery",
  "Chiropractic",
  "Dentistry",
  "Mental Health",
  "Cardiology",
  "Dermatology",
  "Other"
]

export default function NetworkPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties")
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    fetchProviders()
  }, [user])

  useEffect(() => {
    filterProviders()
  }, [providers, searchQuery, selectedSpecialty])

  const fetchProviders = async () => {
    if (!user) return

    try {
      // First check if current user has a provider profile
      const { data: myProvider } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (myProvider) {
        setCurrentProvider(myProvider)
      }

      // Fetch all active providers
      const { data: allProviders, error } = await supabase
        .from("providers")
        .select("*")
        .eq("is_active", true)
        .neq("user_id", user.id)

      if (error) {
        console.error("Error fetching providers:", error)
        // Use demo data if table doesn't exist or is empty
        setProviders(DEMO_PROVIDERS)
      } else if (allProviders && allProviders.length > 0) {
        // Calculate match scores
        const withScores = allProviders.map(p => ({
          ...p,
          match_score: myProvider ? calculateMatchScore(myProvider, p) : 50
        }))
        setProviders(withScores.sort((a, b) => (b.match_score || 0) - (a.match_score || 0)))
      } else {
        // Network is empty, use demo data
        setProviders(DEMO_PROVIDERS)
      }
    } catch (error) {
      console.error("Error:", error)
      setProviders(DEMO_PROVIDERS)
    } finally {
      setLoading(false)
    }
  }

  const calculateMatchScore = (myProvider: Provider, otherProvider: Provider): number => {
    let score = 0

    // Same location required for high score
    if (myProvider.location !== otherProvider.location) {
      return Math.floor(Math.random() * 30) + 20 // Low score for different locations
    }

    // Same specialty = competitors = low score
    if (myProvider.specialty === otherProvider.specialty) {
      return 10
    }

    // I want what they refer
    const iWantTheyRefer = myProvider.patients_i_want?.some(
      p => otherProvider.patients_i_refer?.includes(p)
    )
    if (iWantTheyRefer) score += 40

    // They want what I refer
    const theyWantIRefer = otherProvider.patients_i_want?.some(
      p => myProvider.patients_i_refer?.includes(p)
    )
    if (theyWantIRefer) score += 40

    // Both subscribed bonus
    if (myProvider.subscription_status === "active" && otherProvider.subscription_status === "active") {
      score += 20
    }

    return Math.min(score, 100)
  }

  const filterProviders = () => {
    let filtered = [...providers]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.practice_name.toLowerCase().includes(query) ||
        p.specialty.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      )
    }

    if (selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter(p => p.specialty === selectedSpecialty)
    }

    setFilteredProviders(filtered)
  }

  const handleRequestIntro = (provider: Provider) => {
    // Check if user is subscribed
    if (currentProvider?.subscription_status !== "active") {
      setShowUpgradeModal(true)
      return
    }

    // TODO: Create match request
    console.log("Requesting intro to:", provider.practice_name)
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50"
    if (score >= 60) return "text-violet-600 bg-violet-50"
    if (score >= 40) return "text-amber-600 bg-amber-50"
    return "text-gray-600 bg-gray-50"
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading network...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />

      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Network</h1>
          <p className="text-gray-600">Find and connect with complementary healthcare providers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, specialty, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
              />
            </div>

            {/* Specialty filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none appearance-none bg-white min-w-[200px]"
              >
                {SPECIALTIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredProviders.length}</p>
                <p className="text-sm text-gray-500">Providers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredProviders.filter(p => (p.match_score || 0) >= 70).length}
                </p>
                <p className="text-sm text-gray-500">High Match</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredProviders.map(p => p.location)).size}
                </p>
                <p className="text-sm text-gray-500">Locations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredProviders.map(p => p.specialty)).size}
                </p>
                <p className="text-sm text-gray-500">Specialties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-violet-200 transition-all"
            >
              {/* Match Score Badge */}
              {provider.match_score && (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold mb-4 ${getMatchScoreColor(provider.match_score)}`}>
                  <Star className="w-3 h-3" />
                  {provider.match_score}% Match
                </div>
              )}

              {/* Provider Info */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{provider.practice_name}</h3>
              <p className="text-violet-600 font-medium text-sm mb-2">{provider.specialty}</p>
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                <MapPin className="w-4 h-4" />
                {provider.location}
              </p>

              {provider.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.bio}</p>
              )}

              {/* What they're looking for */}
              {provider.patients_i_want && provider.patients_i_want.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Looking for referrals from:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.patients_i_want.slice(0, 3).map((specialty, i) => (
                      <span key={i} className="px-2 py-1 bg-violet-50 text-violet-600 rounded-full text-xs">
                        {specialty}
                      </span>
                    ))}
                    {provider.patients_i_want.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        +{provider.patients_i_want.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleRequestIntro(provider)}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all flex items-center justify-center gap-2"
              >
                {currentProvider?.subscription_status === "active" ? (
                  <>
                    Request Intro
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Upgrade to Connect
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Connect</h2>
              <p className="text-gray-600 mb-6">
                Subscribe to request introductions and get full access to provider contact information.
              </p>

              <div className="p-4 bg-violet-50 rounded-xl mb-6">
                <p className="text-3xl font-bold text-violet-600">$450<span className="text-lg text-violet-400">/mo</span></p>
                <p className="text-sm text-violet-600">5 guaranteed intros per month</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => router.push("/pricing")}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
