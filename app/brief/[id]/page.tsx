"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope,
  MapPin,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
  Globe,
  Building,
  Shield,
  Sparkles,
  ArrowLeftRight,
  Lightbulb,
  Gift,
  ExternalLink
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

interface BriefData {
  specialty: string
  location: string
  practiceName: string
  sources: ReferralSource[]
  summary: {
    totalSources: number
    avgFitScore: number
    topSpecialty: string
    radiusMiles: number
  }
}

// Generate personalized intro message
function generateIntro(source: ReferralSource, userSpecialty: string, practiceName: string): string {
  const templates = [
    `Hi! I'm a ${userSpecialty} provider at ${practiceName || 'a local practice'} and I often have clients who need ${source.specialty} services. I came across ${source.name} and wanted to reach out - I'd love to refer my clients your way when they need your expertise. Would you be open to a quick chat about how we might work together?`,
    `Hello! I run a ${userSpecialty} practice (${practiceName || 'nearby'}) and I'm looking for a quality ${source.specialty} provider to refer my clients to. Your practice came highly recommended. Would you have 10 minutes for a call? I'd love to learn more about your services so I can confidently send clients your way.`,
    `Hi there! I'm reaching out because I regularly have clients who need ${source.specialty} care, and I'm looking for trusted providers to refer them to. I found ${source.name} and it looks like a great fit. Would you be interested in connecting? I'd love to send some referrals your way.`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

export default function BriefPage() {
  const params = useParams()
  const briefId = params.id as string

  const [data, setData] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedIntro, setExpandedIntro] = useState<string | null>(null)

  useEffect(() => {
    if (briefId) {
      loadBrief()
    }
  }, [briefId])

  const loadBrief = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/brief/${briefId}`)

      if (!response.ok) {
        throw new Error("Failed to load your referral partners")
      }

      const briefData = await response.json()
      setData(briefData)
    } catch (err) {
      console.error("Error loading brief:", err)
      setError("Unable to load your referral partner list. Please contact us for assistance.")
    } finally {
      setLoading(false)
    }
  }

  const copyIntro = async (intro: string, sourceId: string) => {
    await navigator.clipboard.writeText(intro)
    setCopiedId(sourceId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Your Referral Partners</h2>
            <p className="text-slate-400">Finding the best matches for your practice...</p>
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
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-semibold">Your Custom Referral Partner List</span>
          </div>
          {data.practiceName && (
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              {data.practiceName}
            </h1>
          )}
          <p className="text-xl text-slate-400">
            {data.summary.totalSources} {data.specialty} referral partners in <span className="font-semibold text-white">{data.location}</span>
          </p>
        </motion.div>

        {/* Value Exchange Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-amber-500/30 p-6 md:p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ArrowLeftRight className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Make It a Two-Way Street</h2>
                <p className="text-amber-200/80 font-medium">The best referral relationships are mutual</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-slate-900/50 rounded-xl p-5 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">What You Can Offer Them</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Refer your clients</strong> who need their specialty services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Collaborative care</strong> - work together on shared patients</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Cross-promotion</strong> - recommend each other to your networks</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-5 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">How to Reach Out</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200">Click <strong className="text-white font-semibold">"Intro that gets replies"</strong> on any card below</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Copy the message</strong> and personalize it</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200">Send via their website contact form or <strong className="text-white font-semibold">call directly</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-xl border border-amber-500/20">
              <p className="text-base text-amber-100 text-center font-medium">
                <Sparkles className="w-4 h-4 inline mr-2 text-amber-400" />
                <strong className="text-white">Pro tip:</strong> Lead with what you can offer them.
                When you provide value first, referrals naturally flow both ways.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Results Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Referral Partners</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.sources.map((source, index) => {
              const sourceId = `source-${index}`
              const isExpanded = expandedIntro === sourceId
              const intro = generateIntro(source, data.specialty, data.practiceName)
              const accent = accents[index % accents.length]

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.25 + index * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${accent.bg} rounded-2xl blur opacity-0 group-hover:opacity-50 transition-all duration-500`} />

                  <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group-hover:border-slate-500 transition-all duration-300">
                    <div className={`h-2 bg-gradient-to-r ${accent.bg}`} />

                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                          {source.name}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${accent.light}`}>
                          {source.specialty}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 mb-4 p-3 bg-slate-700/50 rounded-xl">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300 font-medium line-clamp-2">{source.address}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-300">
                          <Building className="w-3.5 h-3.5" />
                          In-person
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-lg text-xs font-bold text-violet-300">
                          <Shield className="w-3.5 h-3.5" />
                          Accepts insurance
                        </span>
                      </div>

                      {source.website && (
                        <motion.a
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          href={source.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r ${accent.bg} text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group/btn`}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          <Globe className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Visit Website</span>
                          <motion.span
                            className="relative z-10"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </motion.a>
                      )}
                    </div>

                    {/* Intro Message Section */}
                    <div className="border-t border-slate-600 bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4">
                      <button
                        onClick={() => setExpandedIntro(isExpanded ? null : sourceId)}
                        className="w-full flex items-center justify-between font-bold text-white hover:text-amber-300 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-amber-400" />
                          <span className="text-sm">Intro that gets replies</span>
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
                            <div className="bg-white rounded-xl p-4 border border-slate-300 relative shadow-lg">
                              <p className="text-sm text-slate-800 pr-10 leading-relaxed font-medium">{intro}</p>
                              <button
                                onClick={() => copyIntro(intro, sourceId)}
                                className="absolute top-3 right-3 p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-md"
                                title="Copy to clipboard"
                              >
                                {copiedId === sourceId ? (
                                  <Check className="w-4 h-4 text-white" />
                                ) : (
                                  <Copy className="w-4 h-4 text-white" />
                                )}
                              </button>
                            </div>
                            {copiedId === sourceId && (
                              <p className="text-xs text-emerald-400 mt-2 text-center font-bold">
                                Copied to clipboard!
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-black text-white mb-2">Want to Find More Partners?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto font-medium">
            Create your own referral partner search with different locations or specialties.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-xl text-lg"
          >
            Create Your Own Search
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
