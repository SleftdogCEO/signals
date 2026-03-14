"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  MapPin,
  Star,
  ExternalLink,
  Phone,
  TrendingUp,
  Loader2,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { ALL_SPECIALTIES } from "@/lib/adjacency-map"

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

export default function SnapshotPage() {
  const [data, setData] = useState<SnapshotData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    specialty: "",
    location: "",
    email: "",
    practiceName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.specialty || !form.location || !form.email) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error("Failed to generate snapshot")

      const snapshotData = await response.json()
      setData(snapshotData)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Form view
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Sleft Signals</span>
          </Link>
          <Link
            href="/auth?signup=true"
            className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
        </nav>

        <main className="relative z-20 px-6 lg:px-12 pt-12 pb-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Free Referral Snapshot</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                See Who Could Send You{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Patients
                </span>
              </h1>
              <p className="text-xl text-slate-400 max-w-lg mx-auto">
                Enter your practice details. We&apos;ll show you providers nearby who could become referral partners.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Specialty</label>
                <select
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select your specialty...</option>
                  {ALL_SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Palm Beach Gardens, FL"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Practice Name <span className="text-slate-500">(optional)</span></label>
                <input
                  type="text"
                  value={form.practiceName}
                  onChange={(e) => setForm({ ...form, practiceName: e.target.value })}
                  placeholder="e.g. Summit Physical Therapy"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@yourpractice.com"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding referral partners...
                  </>
                ) : (
                  <>
                    Get Your Free Snapshot
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                Takes 30 seconds. No signup or credit card required.
              </p>
            </form>
          </div>
        </main>
      </div>
    )
  }

  // Results view
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sleft Signals</span>
        </Link>
        <Link
          href="/auth?signup=true"
          className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
        >
          Join the Network
        </Link>
      </nav>

      <main className="relative z-20 px-6 lg:px-12 pt-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Snapshot Ready</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">Your Referral Landscape</h1>
            <p className="text-slate-400 text-lg">
              {data.specialty} in <span className="font-semibold text-white">{data.location}</span>
            </p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-3xl font-black text-blue-400">{data.summary.totalSources}</div>
              <div className="text-sm text-slate-500">Referral Sources</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-3xl font-black text-emerald-400">{data.summary.avgFitScore}%</div>
              <div className="text-sm text-slate-500">Avg Fit Score</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-3xl font-black text-cyan-400">{data.summary.radiusMiles}mi</div>
              <div className="text-sm text-slate-500">Search Radius</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-lg font-bold text-amber-400 truncate">{data.summary.topSpecialty}</div>
              <div className="text-sm text-slate-500">Top Specialty</div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden mb-8"
          >
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Providers Who Could Refer To You</h2>
              <p className="text-sm text-slate-500">Sorted by referral fit score</p>
            </div>

            <div className="divide-y divide-slate-800/50">
              {data.sources.map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-5 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{source.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                          {source.specialty}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {source.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-medium">{source.rating.toFixed(1)}</span>
                          <span className="text-slate-500">({source.reviewCount})</span>
                        </span>
                        {source.phone && (
                          <a href={`tel:${source.phone}`} className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 transition-colors">
                            <Phone className="w-3 h-3" />
                            {source.phone}
                          </a>
                        )}
                        {source.website && (
                          <a href={source.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-black ${
                        source.fitScore >= 80 ? "text-emerald-400" :
                        source.fitScore >= 60 ? "text-yellow-400" : "text-orange-400"
                      }`}>
                        {source.fitScore}
                      </div>
                      <div className="text-xs text-slate-500">Fit Score</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want Warm Introductions?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
              Join the Sleft Signals network. We&apos;ll introduce you directly to these providers — no cold calling, no awkward outreach.
            </p>
            <Link
              href="/auth?signup=true"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-blue-500/25"
            >
              <TrendingUp className="w-5 h-5" />
              Join the Network — Free
            </Link>
            <p className="text-sm text-slate-500 mt-4">Free to join. No credit card required.</p>
          </motion.div>

          {/* Email confirmation */}
          <p className="text-center text-sm text-slate-500 mt-6">
            A copy of this snapshot has been sent to <span className="text-slate-300">{data.email}</span>
          </p>
        </div>
      </main>
    </div>
  )
}
