"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
  RefreshCw
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
  specialty: string
  location: string
  practiceName: string
  email: string
  sources: ReferralSource[]
  summary: {
    totalSources: number
    avgFitScore: number
    topSpecialty: string
    radiusMiles: number
  }
}

export default function DashboardSnapshotPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<SnapshotData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/dashboard/snapshot")
      return
    }

    if (user) {
      loadSnapshot()
    }
  }, [user, authLoading, router])

  const loadSnapshot = async () => {
    try {
      setLoading(true)
      setError("")

      // Get form data from sessionStorage
      const storedData = sessionStorage.getItem("snapshotRequest")

      if (!storedData) {
        setError("No snapshot request found. Please start from the homepage.")
        setLoading(false)
        return
      }

      const formData = JSON.parse(storedData)

      // Call API to generate snapshot
      const response = await fetch("/api/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error("Failed to generate snapshot")
      }

      const snapshotData = await response.json()
      setData(snapshotData)

      // Clear sessionStorage after successful load
      sessionStorage.removeItem("snapshotRequest")

    } catch (err) {
      console.error("Error loading snapshot:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Your Snapshot</h2>
            <p className="text-gray-500">Finding referral opportunities near you...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Sleft Health</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
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

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-blue-600">{data.summary.totalSources}</div>
            <div className="text-sm text-gray-500">Referral Sources</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-emerald-600">{data.summary.avgFitScore}%</div>
            <div className="text-sm text-gray-500">Avg Fit Score</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-cyan-600">{data.summary.radiusMiles}mi</div>
            <div className="text-sm text-gray-500">Search Radius</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="text-lg font-bold text-teal-600 truncate">{data.summary.topSpecialty}</div>
            <div className="text-sm text-gray-500">Top Specialty</div>
          </div>
        </motion.div>

        {/* Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Referral Opportunities</h2>
            <p className="text-sm text-gray-500">Practices whose patients naturally need your services</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Practice</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fit Score</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.sources.map((source, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{source.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {source.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {source.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{source.distance}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-gray-900">{source.rating}</span>
                        <span className="text-gray-400">({source.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className={`h-full rounded-full ${
                              source.fitScore >= 80 ? 'bg-emerald-500' :
                              source.fitScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${source.fitScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-900">{source.fitScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {source.phone && (
                          <a
                            href={`tel:${source.phone}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {source.website && (
                          <a
                            href={source.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {data.sources.map((source, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                className="p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{source.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                      {source.specialty}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{source.fitScore}%</div>
                    <div className="text-xs text-gray-500">Fit Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {source.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {source.rating} ({source.reviewCount})
                  </span>
                </div>
                <div className="text-sm text-gray-500">{source.address}</div>
                <div className="flex items-center gap-2 mt-3">
                  {source.phone && (
                    <a
                      href={`tel:${source.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-2">Want Real-Time Updates?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Upgrade to get live data from Google Places, new referral sources as they open, and direct introductions.
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
