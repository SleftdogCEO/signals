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
  ExternalLink,
  Target,
  Zap,
  Users,
  Calendar,
  FileText,
  Coffee,
  Presentation,
  HandshakeIcon,
  TrendingUp
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

interface MatchInsight {
  score: number
  reasons: string[]
  strengthLevel: 'excellent' | 'strong' | 'good'
}

interface PlaybookAction {
  icon: 'coffee' | 'presentation' | 'document' | 'calendar' | 'handshake'
  title: string
  description: string
  priority: 'high' | 'medium'
}

// Healthcare specialty adjacency map - which specialties commonly refer to each other
const specialtyAdjacency: Record<string, string[]> = {
  'dentist': ['orthodontist', 'oral surgeon', 'periodontist', 'pediatric dentist', 'endodontist', 'prosthodontist', 'family medicine', 'pediatrician', 'ent'],
  'orthodontist': ['dentist', 'oral surgeon', 'pediatric dentist', 'tmj specialist'],
  'chiropractor': ['physical therapist', 'massage therapist', 'orthopedic', 'pain management', 'sports medicine', 'acupuncturist', 'neurologist'],
  'physical therapist': ['chiropractor', 'orthopedic', 'sports medicine', 'pain management', 'neurologist', 'rheumatologist'],
  'dermatologist': ['plastic surgeon', 'allergist', 'rheumatologist', 'oncologist', 'family medicine'],
  'cardiologist': ['internal medicine', 'family medicine', 'endocrinologist', 'nephrologist', 'pulmonologist'],
  'pediatrician': ['pediatric dentist', 'allergist', 'dermatologist', 'ent', 'family medicine'],
  'orthopedic': ['physical therapist', 'chiropractor', 'sports medicine', 'pain management', 'rheumatologist'],
  'optometrist': ['ophthalmologist', 'neurologist', 'endocrinologist', 'family medicine'],
  'psychiatrist': ['psychologist', 'therapist', 'family medicine', 'neurologist', 'internal medicine'],
  'obgyn': ['fertility specialist', 'urologist', 'endocrinologist', 'family medicine', 'pediatrician'],
  'urologist': ['nephrologist', 'oncologist', 'obgyn', 'family medicine'],
  'gastroenterologist': ['internal medicine', 'oncologist', 'nutritionist', 'family medicine'],
  'neurologist': ['psychiatrist', 'physical therapist', 'pain management', 'neurosurgeon', 'family medicine'],
  'ent': ['allergist', 'audiologist', 'sleep specialist', 'pediatrician', 'family medicine'],
  'allergist': ['ent', 'dermatologist', 'pulmonologist', 'pediatrician'],
  'family medicine': ['all'], // family medicine refers to everything
  'internal medicine': ['all'],
}

// Generate match insight based on specialty adjacency and other factors
function generateMatchInsight(source: ReferralSource, userSpecialty: string): MatchInsight {
  const userSpecLower = userSpecialty.toLowerCase()
  const sourceSpecLower = source.specialty.toLowerCase()

  const adjacentSpecs = specialtyAdjacency[userSpecLower] || []
  const isHighlyAdjacent = adjacentSpecs.some(spec => sourceSpecLower.includes(spec)) || adjacentSpecs.includes('all')

  // Parse distance
  const distanceMatch = source.distance.match(/(\d+\.?\d*)/)
  const distanceMiles = distanceMatch ? parseFloat(distanceMatch[1]) : 5
  const isVeryClose = distanceMiles <= 2
  const isClose = distanceMiles <= 5

  // Calculate score (85-98 range to feel realistic)
  let score = 85
  if (isHighlyAdjacent) score += 8
  if (isVeryClose) score += 5
  else if (isClose) score += 2
  if (source.rating >= 4.5) score += 3
  if (source.reviewCount > 50) score += 2

  score = Math.min(98, score)

  // Generate reasons
  const reasons: string[] = []

  if (isHighlyAdjacent) {
    reasons.push(`${source.specialty} practices frequently refer patients to ${userSpecialty} providers`)
  } else {
    reasons.push(`Complementary services create natural referral opportunities`)
  }

  if (isVeryClose) {
    reasons.push(`Only ${source.distance} away — easy for patients to follow through on referrals`)
  } else if (isClose) {
    reasons.push(`Convenient ${source.distance} proximity for patient referrals`)
  }

  if (source.rating >= 4.5) {
    reasons.push(`High patient satisfaction (${source.rating}★) suggests quality-focused practice`)
  } else if (source.rating >= 4.0) {
    reasons.push(`Strong reputation with ${source.reviewCount}+ patient reviews`)
  }

  // Determine strength level
  let strengthLevel: 'excellent' | 'strong' | 'good' = 'good'
  if (score >= 93) strengthLevel = 'excellent'
  else if (score >= 88) strengthLevel = 'strong'

  return { score, reasons, strengthLevel }
}

// Generate specific playbook actions based on context
function generatePlaybook(source: ReferralSource, userSpecialty: string): PlaybookAction[] {
  const actions: PlaybookAction[] = []
  const sourceSpecLower = source.specialty.toLowerCase()

  // Parse distance for proximity-based suggestions
  const distanceMatch = source.distance.match(/(\d+\.?\d*)/)
  const distanceMiles = distanceMatch ? parseFloat(distanceMatch[1]) : 5

  // Everyone gets the intro coffee/call suggestion
  if (distanceMiles <= 3) {
    actions.push({
      icon: 'coffee',
      title: 'Schedule a Coffee Meet',
      description: `They're only ${source.distance} away. Suggest a 20-minute coffee to introduce yourself and learn about their practice.`,
      priority: 'high'
    })
  } else {
    actions.push({
      icon: 'calendar',
      title: 'Book a Quick Intro Call',
      description: `A 15-minute Zoom call to introduce yourself and explore if there's a good fit for referrals.`,
      priority: 'high'
    })
  }

  // Create a referral guide/one-pager
  actions.push({
    icon: 'document',
    title: 'Create a Referral One-Pager',
    description: `Make a simple guide for their front desk: "When to refer to ${userSpecialty}" with your contact info and what you treat.`,
    priority: 'high'
  })

  // Lunch & Learn for certain specialties
  if (['dentist', 'orthodontist', 'chiropractor', 'physical therapist', 'dermatologist', 'pediatrician'].some(s => sourceSpecLower.includes(s))) {
    actions.push({
      icon: 'presentation',
      title: 'Offer a Lunch & Learn',
      description: `Offer to bring lunch and give a 20-minute talk on topics relevant to their patient base.`,
      priority: 'medium'
    })
  }

  // Cross-promotion suggestion
  actions.push({
    icon: 'handshake',
    title: 'Propose Cross-Promotion',
    description: `Offer to display their brochures in your waiting room if they'll do the same. Low effort, mutual benefit.`,
    priority: 'medium'
  })

  return actions.slice(0, 3) // Return top 3 actions
}

// Generate personalized intro message - curiosity-driven, not commitment-driven
function generateIntro(source: ReferralSource, userSpecialty: string, practiceName: string): string {
  const practiceIntro = practiceName ? `I'm with ${practiceName}, a ${userSpecialty} practice` : `I run a ${userSpecialty} practice`

  const templates = [
    `Hi! ${practiceIntro} in the area and I came across ${source.name}. I'm always looking to connect with other healthcare providers — would you have a few minutes for a quick call? I'd love to learn more about your practice and see if there might be ways we could help each other's patients.`,
    `Hello! ${practiceIntro} nearby. I found ${source.name} while researching ${source.specialty} providers in the area and your practice stood out. I'm curious to learn more about the work you do — would you be open to a brief intro call sometime?`,
    `Hi there! ${practiceIntro} and I'm reaching out to connect with other quality providers in our area. I'd love to learn more about ${source.name} and how you serve your patients. Would you have 10 minutes to chat? Always great to know who's doing good work nearby.`
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
          <Link href="/" className="flex items-center gap-4 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl blur-lg opacity-60"
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.15, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40">
                <Stethoscope className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">Sleft Health</span>
              <span className="text-xs text-slate-400 font-medium">Referral Intelligence</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-500/40 rounded-full mb-6 shadow-lg shadow-emerald-500/10"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <span className="text-sm text-emerald-300 font-bold tracking-wide">Your Curated Referral Partners</span>
          </motion.div>

          {data.practiceName && (
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight"
            >
              <motion.span
                className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                {data.practiceName}
              </motion.span>
            </motion.h1>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 font-medium"
          >
            <span className="text-emerald-400 font-bold">{data.summary.totalSources}</span> {data.specialty} referral partners near{" "}
            <span className="font-bold text-white">{data.location}</span>
          </motion.p>
        </motion.div>

        {/* Value Exchange Education - Personalized to their search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-amber-500/30 p-6 md:p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Lightbulb className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-white">Our Suggestion for You</h2>
                <p className="text-amber-200/80 font-medium">How to turn these leads into lasting partnerships</p>
              </div>
            </div>

            {/* Main insight - personalized */}
            <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-600 mb-6">
              <p className="text-lg text-slate-200 leading-relaxed">
                These <span className="text-emerald-400 font-bold">{data.summary.totalSources} {data.specialty} practices</span> near {data.location} are potential partners who could send you clients.
                The key to getting referrals? <span className="text-amber-300 font-semibold">Start a genuine conversation</span> — not a sales pitch.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-slate-900/50 rounded-xl p-5 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">What Actually Works</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Introduce yourself</strong> — who you are, what you do, where you're located</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Express genuine interest</strong> in their practice and how they serve clients</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Suggest a quick call</strong> to explore if there's a good fit</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-5 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Why This Approach Wins</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">No pressure</strong> — you're exploring mutual fit, not asking for favors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Trust builds naturally</strong> when both parties see value</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-200"><strong className="text-white font-semibold">Referrals flow both ways</strong> once you establish a real relationship</span>
                  </li>
                </ul>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-xl border border-emerald-500/30"
            >
              <p className="text-base text-slate-200 text-center font-medium leading-relaxed">
                <Gift className="w-5 h-5 inline mr-2 text-emerald-400" />
                <strong className="text-emerald-300">The best partnerships start with curiosity.</strong>{" "}
                Click "Start a Conversation" on any card below — we've written an opener that focuses on connection, not commitment.
              </p>
            </motion.div>
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
          <div className="grid gap-6 md:grid-cols-2">
            {data.sources.map((source, index) => {
              const sourceId = `source-${index}`
              const isExpanded = expandedIntro === sourceId
              const intro = generateIntro(source, data.specialty, data.practiceName)
              const accent = accents[index % accents.length]
              const matchInsight = generateMatchInsight(source, data.specialty)
              const playbook = generatePlaybook(source, data.specialty)

              const getPlaybookIcon = (iconName: string) => {
                switch (iconName) {
                  case 'coffee': return <Coffee className="w-4 h-4" />
                  case 'presentation': return <Presentation className="w-4 h-4" />
                  case 'document': return <FileText className="w-4 h-4" />
                  case 'calendar': return <Calendar className="w-4 h-4" />
                  case 'handshake': return <HandshakeIcon className="w-4 h-4" />
                  default: return <Zap className="w-4 h-4" />
                }
              }

              const getScoreColor = (level: string) => {
                switch (level) {
                  case 'excellent': return 'from-emerald-500 to-cyan-500'
                  case 'strong': return 'from-blue-500 to-indigo-500'
                  default: return 'from-violet-500 to-purple-500'
                }
              }

              const getScoreBadge = (level: string) => {
                switch (level) {
                  case 'excellent': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'Excellent Match' }
                  case 'strong': return { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', label: 'Strong Match' }
                  default: return { bg: 'bg-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-400', label: 'Good Match' }
                }
              }

              const scoreBadge = getScoreBadge(matchInsight.strengthLevel)

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
                  className="relative group"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${accent.bg} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500`} />

                  <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group-hover:border-slate-600 transition-all duration-300">
                    {/* Header with Match Score */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                            {source.name}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${accent.light}`}>
                            {source.specialty}
                          </span>
                        </div>

                        {/* Match Score Circle */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-slate-700"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="url(#scoreGradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${(matchInsight.score / 100) * 176} 176`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                              />
                              <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-black text-white">{matchInsight.score}</span>
                            </div>
                          </div>
                          <div className={`mt-1 px-2 py-0.5 ${scoreBadge.bg} ${scoreBadge.border} border rounded-full`}>
                            <span className={`text-[10px] font-bold ${scoreBadge.text} whitespace-nowrap`}>{scoreBadge.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 mb-4 p-3 bg-slate-700/50 rounded-xl">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300 font-medium line-clamp-2">{source.address}</p>
                      </div>

                      {/* Why This Match - Intelligence Layer */}
                      <div className="mb-4 p-4 bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-xl border border-slate-600/50">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-6 h-6 bg-gradient-to-r ${getScoreColor(matchInsight.strengthLevel)} rounded-lg flex items-center justify-center`}>
                            <Target className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-bold text-white">Why This Match</span>
                        </div>
                        <ul className="space-y-2">
                          {matchInsight.reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-300 leading-relaxed">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Partnership Playbook */}
                      <div className="mb-4 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-bold text-white">Your Action Plan</span>
                        </div>
                        <div className="space-y-2">
                          {playbook.map((action, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg ${action.priority === 'high' ? 'bg-slate-800/80 border border-emerald-500/30' : 'bg-slate-800/50 border border-slate-600/50'}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${action.priority === 'high' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/50 text-slate-400'}`}>
                                  {getPlaybookIcon(action.icon)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">{action.title}</span>
                                    {action.priority === 'high' && (
                                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">START HERE</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{action.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Info Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-300">
                          <Building className="w-3.5 h-3.5" />
                          In-person
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-lg text-xs font-bold text-violet-300">
                          <Shield className="w-3.5 h-3.5" />
                          Accepts insurance
                        </span>
                      </div>

                      {/* Visit Website Button */}
                      {source.website && (
                        <motion.a
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          href={source.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r ${accent.bg} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all relative overflow-hidden`}
                        >
                          <Globe className="w-5 h-5" />
                          <span>Visit Website</span>
                          <ExternalLink className="w-4 h-4" />
                        </motion.a>
                      )}
                    </div>

                    {/* Intro Message Section */}
                    <div className="border-t border-slate-600 bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4">
                      <button
                        onClick={() => setExpandedIntro(isExpanded ? null : sourceId)}
                        className="w-full flex items-center justify-between font-bold text-white hover:text-emerald-300 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm">Start a Conversation</span>
                          <Sparkles className="w-3 h-3 text-emerald-400" />
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
