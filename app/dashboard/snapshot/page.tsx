"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope,
  MapPin,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
  Globe,
  Building,
  Sparkles,
  X,
  Plus,
  Search,
  Zap
} from "lucide-react"
import Link from "next/link"
import { ALL_SPECIALTIES, getAdjacentSpecialties } from "@/lib/adjacency-map"

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

interface SearchData {
  id?: string
  specialty: string
  location: string
  practiceName: string
  email: string
  sources: ReferralSource[]
  createdAt?: string
  summary: {
    totalSources: number
    avgFitScore: number
    topSpecialty: string
    radiusMiles: number
  }
}

const MAX_SEARCHES = 3

// Generate personalized intro message - framed as offering referrals TO them first
function generateIntro(source: ReferralSource, userSpecialty: string, practiceName: string): string {
  const templates = [
    `Hi! I'm a ${userSpecialty} provider at ${practiceName || 'a local practice'} and I often have clients who need ${source.specialty} services. I came across ${source.name} and wanted to reach out - I'd love to refer my clients your way when they need your expertise. Would you be open to a quick chat about how we might work together?`,
    `Hello! I run a ${userSpecialty} practice (${practiceName || 'nearby'}) and I'm looking for a quality ${source.specialty} provider to refer my clients to. Your practice came highly recommended. Would you have 10 minutes for a call? I'd love to learn more about your services so I can confidently send clients your way.`,
    `Hi there! I'm reaching out because I regularly have clients who need ${source.specialty} care, and I'm looking for trusted providers to refer them to. I found ${source.name} and it looks like a great fit. Would you be interested in connecting? I'd love to send some referrals your way.`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

// Get saved searches from localStorage
function getSavedSearches(): SearchData[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem("userSnapshots")
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Save searches to localStorage
function saveSearches(searches: SearchData[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem("userSnapshots", JSON.stringify(searches))
}

export default function DashboardSnapshotPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<SearchData | null>(null)
  const [savedSearches, setSavedSearches] = useState<SearchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedIntro, setExpandedIntro] = useState<string | null>(null)
  const [selectedRadius, setSelectedRadius] = useState(10)
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  const [showSearchSelector, setShowSearchSelector] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showNewSearchForm, setShowNewSearchForm] = useState(false)
  const [newSearchForm, setNewSearchForm] = useState({
    specialty: "",
    location: "",
    practiceName: ""
  })

  const radiusOptions = [
    { value: 10, label: "10 miles", description: "Local area" },
    { value: 25, label: "25 miles", description: "Extended reach" },
    { value: 50, label: "50 miles", description: "Regional" },
  ]

  // Get adjacent specialties for current user specialty
  const adjacentSpecialties = data ? getAdjacentSpecialties(data.specialty) : []

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/dashboard/snapshot")
      return
    }

    if (user) {
      const saved = getSavedSearches()
      setSavedSearches(saved)
      loadSearch()
    }
  }, [user, authLoading, router])

  const loadSearch = async (radius?: number, specialty?: string, forceNew?: boolean) => {
    try {
      setLoading(true)
      setError("")

      const storedData = sessionStorage.getItem("snapshotRequest")
      const existingSearches = getSavedSearches()
      setSavedSearches(existingSearches)

      if (storedData) {
        const formData = JSON.parse(storedData)

        if (existingSearches.length >= MAX_SEARCHES && !forceNew) {
          setError(`You've reached the maximum of ${MAX_SEARCHES} searches. Delete one to create a new one.`)
          setLoading(false)
          if (existingSearches.length > 0) {
            setData(existingSearches[0])
            setSelectedSpecialty(existingSearches[0].summary?.topSpecialty || "")
          }
          sessionStorage.removeItem("snapshotRequest")
          return
        }

        const response = await fetch("/api/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            userId: user?.id,
            radiusMiles: radius || selectedRadius,
            filterSpecialty: specialty || undefined
          })
        })

        if (!response.ok) {
          throw new Error("Failed to generate search")
        }

        const searchData = await response.json()

        const newSearch: SearchData = {
          ...searchData,
          id: `search-${Date.now()}`,
          createdAt: new Date().toISOString()
        }

        setData(newSearch)
        setSelectedRadius(newSearch.summary?.radiusMiles || radius || 10)
        setSelectedSpecialty(newSearch.summary?.topSpecialty || "")

        const updatedSearches = [newSearch, ...existingSearches].slice(0, MAX_SEARCHES)
        saveSearches(updatedSearches)
        setSavedSearches(updatedSearches)

        localStorage.setItem("lastSnapshotResult", JSON.stringify(newSearch))
        sessionStorage.removeItem("snapshotRequest")

      } else if (existingSearches.length > 0) {
        setData(existingSearches[0])
        setSelectedRadius(existingSearches[0].summary?.radiusMiles || 10)
        setSelectedSpecialty(existingSearches[0].summary?.topSpecialty || "")
      } else {
        const cachedSearch = localStorage.getItem("lastSnapshotResult")
        if (cachedSearch) {
          try {
            const parsed = JSON.parse(cachedSearch)
            const migratedSearch = {
              ...parsed,
              id: `search-${Date.now()}`,
              createdAt: new Date().toISOString()
            }
            setData(migratedSearch)
            setSelectedRadius(parsed.summary?.radiusMiles || 10)
            setSelectedSpecialty(parsed.summary?.topSpecialty || "")
            saveSearches([migratedSearch])
            setSavedSearches([migratedSearch])
          } catch {
            setError("No search found. Create your first one!")
            setShowNewSearchForm(true)
          }
        } else {
          setError("No search found. Create your first one!")
          setShowNewSearchForm(true)
        }
      }

    } catch (err) {
      console.error("Error loading search:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setRegenerating(false)
    }
  }

  const handleRadiusChange = async (radius: number) => {
    setSelectedRadius(radius)
    setShowRadiusDropdown(false)
    setRegenerating(true)

    if (data) {
      sessionStorage.setItem("snapshotRequest", JSON.stringify({
        specialty: data.specialty,
        location: data.location,
        email: data.email,
        practiceName: data.practiceName
      }))
    }

    await loadSearch(radius, selectedSpecialty, true)
  }

  const handleSpecialtyChange = async (specialty: string) => {
    setSelectedSpecialty(specialty)
    setShowSpecialtyDropdown(false)
    setRegenerating(true)

    if (data) {
      sessionStorage.setItem("snapshotRequest", JSON.stringify({
        specialty: data.specialty,
        location: data.location,
        email: data.email,
        practiceName: data.practiceName
      }))
    }

    await loadSearch(selectedRadius, specialty, true)
  }

  const switchToSearch = (search: SearchData) => {
    setData(search)
    setSelectedRadius(search.summary?.radiusMiles || 10)
    setSelectedSpecialty(search.summary?.topSpecialty || "")
    setShowSearchSelector(false)
  }

  const deleteSearch = (searchId: string) => {
    const updated = savedSearches.filter(s => s.id !== searchId)
    saveSearches(updated)
    setSavedSearches(updated)

    if (data?.id === searchId) {
      if (updated.length > 0) {
        setData(updated[0])
      } else {
        setData(null)
        setShowNewSearchForm(true)
      }
    }
  }

  const handleCreateNewSearch = () => {
    if (savedSearches.length >= MAX_SEARCHES) {
      setError(`You've reached the maximum of ${MAX_SEARCHES} searches. Delete one to create a new one.`)
      return
    }
    setShowNewSearchForm(true)
  }

  const submitNewSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSearchForm.specialty || !newSearchForm.location) {
      return
    }

    sessionStorage.setItem("snapshotRequest", JSON.stringify({
      ...newSearchForm,
      email: user?.email || data?.email || ""
    }))

    setShowNewSearchForm(false)
    setLoading(true)
    await loadSearch()
  }

  const copyIntro = async (intro: string, sourceId: string) => {
    await navigator.clipboard.writeText(intro)
    setCopiedId(sourceId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const searchesRemaining = MAX_SEARCHES - savedSearches.length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              {regenerating ? "Updating Results..." : "Finding Referral Partners"}
            </h2>
            <p className="text-slate-400">This won't take long...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show new search form
  if (showNewSearchForm || (!data && !loading)) {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Sleft Health</span>
            </Link>
            {savedSearches.length > 0 && (
              <button
                onClick={() => {
                  setShowNewSearchForm(false)
                  setData(savedSearches[0])
                }}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Back to results
              </button>
            )}
          </div>
        </header>

        <main className="max-w-lg mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">New Search</h2>
              <p className="text-slate-400">
                {searchesRemaining > 0
                  ? `${searchesRemaining} search${searchesRemaining === 1 ? '' : 'es'} remaining`
                  : "Delete an existing search first"}
              </p>
            </div>

            {searchesRemaining > 0 ? (
              <form onSubmit={submitNewSearch} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Your Specialty
                  </label>
                  <select
                    value={newSearchForm.specialty}
                    onChange={(e) => setNewSearchForm({ ...newSearchForm, specialty: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    required
                  >
                    <option value="">Select specialty</option>
                    {ALL_SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newSearchForm.location}
                    onChange={(e) => setNewSearchForm({ ...newSearchForm, location: e.target.value })}
                    placeholder="e.g., Miami, FL or 33139"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Practice Name <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newSearchForm.practiceName}
                    onChange={(e) => setNewSearchForm({ ...newSearchForm, practiceName: e.target.value })}
                    placeholder="e.g., Miami Psychology Associates"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30 mt-2"
                >
                  Find Referral Partners
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-slate-400">Select a search to delete:</p>
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                    <div>
                      <p className="font-bold text-white">{search.specialty}</p>
                      <p className="text-sm text-slate-400">{search.location}</p>
                    </div>
                    <button
                      onClick={() => deleteSearch(search.id!)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Start Over
          </Link>
        </div>
      </div>
    )
  }

  if (!data) return null

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
            {/* Search selector */}
            {savedSearches.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowSearchSelector(!showSearchSelector)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold text-white transition-colors border border-slate-600"
                >
                  <Search className="w-4 h-4" />
                  My Searches ({savedSearches.length})
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSearchSelector ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showSearchSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-20 overflow-hidden"
                    >
                      {savedSearches.map((search) => (
                        <button
                          key={search.id}
                          onClick={() => switchToSearch(search)}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between ${
                            data?.id === search.id ? 'bg-slate-700' : ''
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-white">{search.specialty}</div>
                            <div className="text-sm text-slate-400">{search.location}</div>
                          </div>
                          {data?.id === search.id && (
                            <Check className="w-4 h-4 text-blue-400" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* New search button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateNewSearch}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                searchesRemaining > 0
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
              disabled={searchesRemaining === 0}
            >
              <Plus className="w-4 h-4" />
              New Search ({searchesRemaining})
            </motion.button>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-semibold">Results Ready</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Your Referral Partners
          </h1>
          <p className="text-xl text-slate-400">
            {data.specialty} providers in <span className="font-semibold text-white">{data.location}</span>
          </p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          {/* Specialty Filter */}
          <div className="relative">
            <button
              onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
              className="flex items-center gap-3 px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-semibold transition-colors border border-slate-700"
            >
              <Stethoscope className="w-5 h-5 text-blue-400" />
              <span>{selectedSpecialty || "All Specialties"}</span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showSpecialtyDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSpecialtyDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-64 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-20 overflow-hidden max-h-80 overflow-y-auto"
                >
                  <button
                    onClick={() => handleSpecialtyChange("")}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors font-medium ${
                      !selectedSpecialty ? 'bg-slate-700 text-blue-400' : 'text-white'
                    }`}
                  >
                    All Specialties
                  </button>
                  {adjacentSpecialties.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => handleSpecialtyChange(specialty)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors font-medium ${
                        selectedSpecialty === specialty ? 'bg-slate-700 text-blue-400' : 'text-white'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Radius Filter */}
          <div className="relative">
            <button
              onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
              className="flex items-center gap-3 px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-semibold transition-colors border border-slate-700"
            >
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>{selectedRadius} miles</span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showRadiusDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showRadiusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-56 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-20 overflow-hidden"
                >
                  {radiusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRadiusChange(option.value)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                        selectedRadius === option.value ? 'bg-slate-700' : ''
                      }`}
                    >
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.description}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <span className="text-3xl font-black text-white">{data.summary.totalSources}</span>
            <span className="text-slate-400 font-medium">partners found</span>
          </div>
        </motion.div>

        {/* Results Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.sources.map((source, index) => {
              const sourceId = `source-${index}`
              const isExpanded = expandedIntro === sourceId
              const intro = generateIntro(source, data.specialty, data.practiceName)

              // Rotate through accent colors
              const accents = [
                { bg: 'from-blue-500 to-cyan-400', light: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                { bg: 'from-violet-500 to-purple-400', light: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
                { bg: 'from-emerald-500 to-teal-400', light: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                { bg: 'from-rose-500 to-pink-400', light: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
                { bg: 'from-amber-500 to-orange-400', light: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                { bg: 'from-indigo-500 to-blue-400', light: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
              ]
              const accent = accents[index % accents.length]

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.1 + index * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300 group"
                >
                  {/* Accent bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${accent.bg}`} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                        {source.name}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${accent.light}`}>
                        {source.specialty}
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-4 p-3 bg-slate-700/50 rounded-xl">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 font-medium line-clamp-2">{source.address}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs font-semibold text-slate-300">
                        <Building className="w-3.5 h-3.5" />
                        In-person
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {source.phone && (
                        <motion.a
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          href={`tel:${source.phone}`}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </motion.a>
                      )}
                      {source.website && (
                        <motion.a
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          href={source.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </motion.a>
                      )}
                    </div>
                  </div>

                  {/* Intro Message Section */}
                  <div className="border-t border-slate-700 bg-slate-800/50 p-4">
                    <button
                      onClick={() => setExpandedIntro(isExpanded ? null : sourceId)}
                      className="w-full flex items-center justify-between text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Intro that gets replies</span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3"
                        >
                          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 relative">
                            <p className="text-sm text-slate-200 pr-10 leading-relaxed font-medium">{intro}</p>
                            <button
                              onClick={() => copyIntro(intro, sourceId)}
                              className="absolute top-3 right-3 p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedId === sourceId ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-300" />
                              )}
                            </button>
                          </div>
                          {copiedId === sourceId && (
                            <p className="text-xs text-emerald-400 mt-2 text-center font-semibold">
                              Copied to clipboard!
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 rounded-2xl p-8 text-center"
        >
          <Zap className="w-12 h-12 text-white/90 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Want More Partners?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto font-medium">
            Upgrade for unlimited searches, real-time updates, and warm introductions.
          </p>
          <button
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-xl text-lg"
          >
            Coming Soon
          </button>
        </motion.div>
      </main>
    </div>
  )
}
