"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope,
  MapPin,
  Star,
  ExternalLink,
  Phone,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
  Globe,
  Video,
  Building,
  Shield,
  Sparkles,
  X,
  Plus,
  FileText
} from "lucide-react"
import Link from "next/link"

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

interface SnapshotData {
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

const MAX_SNAPSHOTS = 3

// Generate personalized intro message
function generateIntro(source: ReferralSource, userSpecialty: string, practiceName: string): string {
  const templates = [
    `Hi! I'm reaching out from ${practiceName || 'our practice'}. We specialize in ${userSpecialty} and noticed your ${source.specialty} practice serves patients in the same area. Many of your patients may benefit from our services, and vice versa. Would you be open to a brief call to explore a referral partnership?`,
    `Hello! I'm a ${userSpecialty} provider at ${practiceName || 'a local practice'} and I'm looking to connect with quality ${source.specialty} providers like ${source.name}. I think there could be great synergy between our practices for patient referrals. Would you be interested in connecting?`,
    `Hi there! I found ${source.name} while researching ${source.specialty} providers in our area. I run a ${userSpecialty} practice nearby (${practiceName || ''}) and I'd love to establish a referral relationship. Many of my patients could benefit from your expertise. Coffee or quick call sometime?`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

// Get saved snapshots from localStorage
function getSavedSnapshots(): SnapshotData[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem("userSnapshots")
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Save snapshots to localStorage
function saveSnapshots(snapshots: SnapshotData[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem("userSnapshots", JSON.stringify(snapshots))
}

export default function DashboardSnapshotPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<SnapshotData | null>(null)
  const [savedSnapshots, setSavedSnapshots] = useState<SnapshotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedIntro, setExpandedIntro] = useState<string | null>(null)
  const [selectedRadius, setSelectedRadius] = useState(10)
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false)
  const [showSnapshotSelector, setShowSnapshotSelector] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showNewSnapshotForm, setShowNewSnapshotForm] = useState(false)
  const [newSnapshotForm, setNewSnapshotForm] = useState({
    specialty: "",
    location: "",
    practiceName: ""
  })

  const radiusOptions = [
    { value: 10, label: "10 miles", description: "Local area" },
    { value: 25, label: "25 miles", description: "Extended reach" },
    { value: 50, label: "50 miles", description: "Regional" },
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/dashboard/snapshot")
      return
    }

    if (user) {
      // Load saved snapshots
      const saved = getSavedSnapshots()
      setSavedSnapshots(saved)
      loadSnapshot()
    }
  }, [user, authLoading, router])

  const loadSnapshot = async (radius?: number, forceNew?: boolean) => {
    try {
      setLoading(true)
      setError("")

      // Get form data from sessionStorage (new request)
      const storedData = sessionStorage.getItem("snapshotRequest")

      // Load existing snapshots
      const existingSnapshots = getSavedSnapshots()
      setSavedSnapshots(existingSnapshots)

      // If we have a new request in session, process it
      if (storedData) {
        const formData = JSON.parse(storedData)

        // Check if we've hit the limit
        if (existingSnapshots.length >= MAX_SNAPSHOTS && !forceNew) {
          setError(`You've reached the maximum of ${MAX_SNAPSHOTS} snapshots. Delete one to create a new one.`)
          setLoading(false)
          // Show the most recent snapshot
          if (existingSnapshots.length > 0) {
            setData(existingSnapshots[0])
          }
          sessionStorage.removeItem("snapshotRequest")
          return
        }

        // Call API to generate snapshot
        const response = await fetch("/api/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            userId: user?.id,
            radiusMiles: radius || selectedRadius
          })
        })

        if (!response.ok) {
          throw new Error("Failed to generate snapshot")
        }

        const snapshotData = await response.json()

        // Add metadata
        const newSnapshot: SnapshotData = {
          ...snapshotData,
          id: `snapshot-${Date.now()}`,
          createdAt: new Date().toISOString()
        }

        setData(newSnapshot)
        setSelectedRadius(newSnapshot.summary?.radiusMiles || radius || 10)

        // Save to snapshots list (prepend new one)
        const updatedSnapshots = [newSnapshot, ...existingSnapshots].slice(0, MAX_SNAPSHOTS)
        saveSnapshots(updatedSnapshots)
        setSavedSnapshots(updatedSnapshots)

        // Also keep lastSnapshotResult for backwards compatibility
        localStorage.setItem("lastSnapshotResult", JSON.stringify(newSnapshot))

        // Clear sessionStorage after successful load
        sessionStorage.removeItem("snapshotRequest")

      } else if (existingSnapshots.length > 0) {
        // No new request, show most recent snapshot
        setData(existingSnapshots[0])
        setSelectedRadius(existingSnapshots[0].summary?.radiusMiles || 10)
      } else {
        // Check old format for backwards compatibility
        const cachedSnapshot = localStorage.getItem("lastSnapshotResult")
        if (cachedSnapshot) {
          try {
            const parsed = JSON.parse(cachedSnapshot)
            const migratedSnapshot = {
              ...parsed,
              id: `snapshot-${Date.now()}`,
              createdAt: new Date().toISOString()
            }
            setData(migratedSnapshot)
            setSelectedRadius(parsed.summary?.radiusMiles || 10)
            // Migrate to new format
            saveSnapshots([migratedSnapshot])
            setSavedSnapshots([migratedSnapshot])
          } catch {
            setError("No snapshot found. Create your first one!")
            setShowNewSnapshotForm(true)
          }
        } else {
          setError("No snapshot found. Create your first one!")
          setShowNewSnapshotForm(true)
        }
      }

    } catch (err) {
      console.error("Error loading snapshot:", err)
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

    // Store current form data back to session for re-fetch
    if (data) {
      sessionStorage.setItem("snapshotRequest", JSON.stringify({
        specialty: data.specialty,
        location: data.location,
        email: data.email,
        practiceName: data.practiceName
      }))
    }

    await loadSnapshot(radius, true)
  }

  const switchToSnapshot = (snapshot: SnapshotData) => {
    setData(snapshot)
    setSelectedRadius(snapshot.summary?.radiusMiles || 10)
    setShowSnapshotSelector(false)
  }

  const deleteSnapshot = (snapshotId: string) => {
    const updated = savedSnapshots.filter(s => s.id !== snapshotId)
    saveSnapshots(updated)
    setSavedSnapshots(updated)

    // If we deleted the current one, switch to another
    if (data?.id === snapshotId) {
      if (updated.length > 0) {
        setData(updated[0])
      } else {
        setData(null)
        setShowNewSnapshotForm(true)
      }
    }
  }

  const handleCreateNewSnapshot = () => {
    if (savedSnapshots.length >= MAX_SNAPSHOTS) {
      setError(`You've reached the maximum of ${MAX_SNAPSHOTS} snapshots. Delete one to create a new one.`)
      return
    }
    setShowNewSnapshotForm(true)
  }

  const submitNewSnapshot = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSnapshotForm.specialty || !newSnapshotForm.location) {
      return
    }

    // Store in session and reload
    sessionStorage.setItem("snapshotRequest", JSON.stringify({
      ...newSnapshotForm,
      email: user?.email || data?.email || ""
    }))

    setShowNewSnapshotForm(false)
    setLoading(true)
    await loadSnapshot()
  }

  const copyIntro = async (intro: string, sourceId: string) => {
    await navigator.clipboard.writeText(intro)
    setCopiedId(sourceId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const snapshotsRemaining = MAX_SNAPSHOTS - savedSnapshots.length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {regenerating ? "Expanding Search Area..." : "Generating Your Snapshot"}
            </h2>
            <p className="text-gray-500">Finding referral opportunities near you...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show new snapshot form
  if (showNewSnapshotForm || (!data && !loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Sleft Health</span>
            </Link>
            {savedSnapshots.length > 0 && (
              <button
                onClick={() => {
                  setShowNewSnapshotForm(false)
                  setData(savedSnapshots[0])
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back to snapshots
              </button>
            )}
          </div>
        </header>

        <main className="max-w-lg mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Snapshot</h2>
              <p className="text-gray-500">
                {snapshotsRemaining > 0
                  ? `You have ${snapshotsRemaining} snapshot${snapshotsRemaining === 1 ? '' : 's'} remaining`
                  : "Delete an existing snapshot to create a new one"}
              </p>
            </div>

            {snapshotsRemaining > 0 ? (
              <form onSubmit={submitNewSnapshot} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Specialty *
                  </label>
                  <select
                    value={newSnapshotForm.specialty}
                    onChange={(e) => setNewSnapshotForm({ ...newSnapshotForm, specialty: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    required
                  >
                    <option value="">Select specialty</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Physical Therapy">Physical Therapy</option>
                    <option value="Chiropractic">Chiropractic</option>
                    <option value="Primary Care">Primary Care</option>
                    <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newSnapshotForm.location}
                    onChange={(e) => setNewSnapshotForm({ ...newSnapshotForm, location: e.target.value })}
                    placeholder="e.g., Miami, FL or 33139"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Practice Name (optional)
                  </label>
                  <input
                    type="text"
                    value={newSnapshotForm.practiceName}
                    onChange={(e) => setNewSnapshotForm({ ...newSnapshotForm, practiceName: e.target.value })}
                    placeholder="e.g., Miami Psychology Associates"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:via-cyan-700 hover:to-teal-600 transition-all shadow-lg"
                >
                  Generate Snapshot
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-gray-600">Select a snapshot to delete:</p>
                {savedSnapshots.map((snapshot) => (
                  <div key={snapshot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{snapshot.specialty}</p>
                      <p className="text-sm text-gray-500">{snapshot.location}</p>
                    </div>
                    <button
                      onClick={() => deleteSnapshot(snapshot.id!)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Sleft Health</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Snapshot selector */}
            {savedSnapshots.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowSnapshotSelector(!showSnapshotSelector)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {savedSnapshots.length} Snapshots
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSnapshotSelector ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showSnapshotSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden"
                    >
                      {savedSnapshots.map((snapshot) => (
                        <button
                          key={snapshot.id}
                          onClick={() => switchToSnapshot(snapshot)}
                          className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                            data?.id === snapshot.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{snapshot.specialty}</div>
                            <div className="text-sm text-gray-500">{snapshot.location}</div>
                          </div>
                          {data?.id === snapshot.id && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* New snapshot button */}
            <button
              onClick={handleCreateNewSnapshot}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                snapshotsRemaining > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={snapshotsRemaining === 0}
              title={snapshotsRemaining === 0 ? 'Delete a snapshot to create a new one' : ''}
            >
              <Plus className="w-4 h-4" />
              New ({snapshotsRemaining} left)
            </button>

            <span className="text-sm text-gray-500 hidden md:inline">{user?.email}</span>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border border-teal-200 rounded-full shadow-sm mb-4">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <span className="text-sm text-teal-700 font-semibold">Snapshot Ready</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Your Referral Opportunities
          </h1>
          <p className="text-gray-600 text-lg">
            {data.specialty} practices in <span className="font-semibold">{data.location}</span> who could send you patients
          </p>
        </motion.div>

        {/* Summary Cards with Radius Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{data.summary.totalSources}</div>
            <div className="text-sm text-gray-500">Referral Sources</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600">{data.summary.avgFitScore}%</div>
            <div className="text-sm text-gray-500">Avg Fit Score</div>
          </div>

          {/* Radius Selector */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm relative">
            <button
              onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
              className="w-full text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-cyan-600">{selectedRadius}mi</div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showRadiusDropdown ? 'rotate-180' : ''}`} />
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                Search Radius
                <span className="text-xs text-blue-500 group-hover:underline">(change)</span>
              </div>
            </button>

            <AnimatePresence>
              {showRadiusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden"
                >
                  {radiusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRadiusChange(option.value)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        selectedRadius === option.value ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                      {selectedRadius === option.value && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                  <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
                    <p className="text-xs text-amber-700">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Referrals often come from farther away than you'd expect!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="text-lg font-bold text-teal-600 truncate">{data.summary.topSpecialty}</div>
            <div className="text-sm text-gray-500">Top Specialty</div>
          </div>
        </motion.div>

        {/* Results - Card Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Referral Partners</h2>
              <p className="text-sm text-gray-500">Practices whose patients naturally need your services</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.sources.map((source, index) => {
              const sourceId = `source-${index}`
              const isExpanded = expandedIntro === sourceId
              const intro = generateIntro(source, data.specialty, data.practiceName)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group"
                >
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {source.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                          {source.specialty}
                        </span>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-2xl font-bold text-emerald-600">{source.fitScore}</div>
                        <div className="text-xs text-gray-400">Fit Score</div>
                      </div>
                    </div>

                    {/* Rating & Distance */}
                    <div className="flex items-center gap-3 mb-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{source.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({source.reviewCount})</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {source.distance}
                      </span>
                    </div>

                    {/* Address */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{source.address}</p>

                    {/* Future Enhancement Placeholders */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
                        <Building className="w-3 h-3" />
                        In-person
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
                        <Shield className="w-3 h-3" />
                        Accepts insurance
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {source.phone && (
                        <a
                          href={`tel:${source.phone}`}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </a>
                      )}
                      {source.website && (
                        <a
                          href={source.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Intro Message Section */}
                  <div className="border-t border-gray-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4">
                    <button
                      onClick={() => setExpandedIntro(isExpanded ? null : sourceId)}
                      className="w-full flex items-center justify-between text-sm font-medium text-violet-700 hover:text-violet-800"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Intro that gets replies</span>
                        <Sparkles className="w-3 h-3 text-amber-500" />
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
                          <div className="bg-white rounded-xl p-3 border border-violet-200 relative">
                            <p className="text-sm text-gray-700 pr-8 leading-relaxed">{intro}</p>
                            <button
                              onClick={() => copyIntro(intro, sourceId)}
                              className="absolute top-2 right-2 p-2 bg-violet-100 hover:bg-violet-200 rounded-lg transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedId === sourceId ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-violet-600" />
                              )}
                            </button>
                          </div>
                          {copiedId === sourceId && (
                            <p className="text-xs text-emerald-600 mt-2 text-center font-medium">
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
          className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-2">Want More Referral Partners?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Upgrade to get unlimited searches, real-time updates, insurance matching, and direct warm introductions.
          </p>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
          >
            <TrendingUp className="w-5 h-5" />
            Coming Soon
          </button>
        </motion.div>
      </main>
    </div>
  )
}
