"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Calendar,
  Newspaper,
  Star,
  Users,
  Clock,
  Building2,
  TrendingUp,
  Sparkles,
} from "lucide-react"

interface Lead {
  businessName?: string
  name?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  category?: string
  rating?: number
  reviewsCount?: number
  leadScore?: number
}

interface NewsArticle {
  title?: string
  source?: string
  link?: string
  url?: string
  snippet?: string
  description?: string
  date?: string
  published?: string
  relevanceScore?: number
}

interface Event {
  eventName?: string
  name?: string
  title?: string
  date?: string
  address?: string
  location?: string
  eventUrl?: string
  url?: string
  organizedByGroup?: string
  organizer?: string
  maxAttendees?: number
  actualAttendees?: number
  type?: string
}

interface Brief {
  id: string
  businessName: string
  metadata?: {
    industry?: string
    location?: string
  }
  businessData?: {
    leads?: Lead[]
  }
  newsData?: {
    articles?: NewsArticle[]
  }
  meetupData?: {
    events?: Event[]
  }
}

interface BriefPageProps {
  params: Promise<{ id: string }>
}

export default function BriefPage({ params }: BriefPageProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [briefId, setBriefId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolved = await params
      setBriefId(resolved.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (briefId && briefId !== "null" && briefId !== "undefined") {
      fetchBrief(briefId)
    }
  }, [briefId])

  const fetchBrief = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/briefs/${id}`)
      const data = await response.json()

      if (data.success && data.brief) {
        setBrief(data.brief)
      } else {
        setError("Brief not found")
      }
    } catch (err) {
      setError("Failed to load brief")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/50 via-pink-400/40 to-orange-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/50 via-teal-400/40 to-emerald-300/30 rounded-full blur-3xl"
          />
        </div>
        <div className="relative flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your brief...</p>
        </div>
      </div>
    )
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/50 via-pink-400/40 to-orange-300/30 rounded-full blur-3xl"
          />
        </div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center max-w-md border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-gray-600 mb-6">{error || "Brief not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white rounded-xl font-medium hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-lg shadow-fuchsia-500/25"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const leads = brief.businessData?.leads || []
  const news = brief.newsData?.articles || []
  const events = brief.meetupData?.events || []

  const getLeadScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-600"
    if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200"
    return "bg-rose-100 text-rose-700 border-rose-200"
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Vibrant background with colorful gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, 40, 0],
            y: [0, 40, 80, 0],
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/30 via-pink-400/20 to-orange-300/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, -30, 0],
            y: [0, 60, 30, 0],
            scale: [1, 1.15, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/30 via-teal-400/20 to-emerald-300/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 1.2, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-violet-400/20 via-purple-400/10 to-indigo-300/5 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-colors shadow-sm border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{brief.businessName}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="w-4 h-4" />
                <span>{brief.metadata?.industry}</span>
                <span className="text-gray-300">•</span>
                <MapPin className="w-4 h-4" />
                <span>{brief.metadata?.location}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium">
                {leads.length} Leads
              </span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                {news.length} News
              </span>
              <span className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-sm font-medium">
                {events.length} Events
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Leads Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Local Leads</h2>
              <p className="text-gray-500">{leads.length} potential opportunities discovered</p>
            </div>
          </div>

          {leads.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {leads.slice(0, 10).map((lead, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                      {lead.businessName || lead.name || "Business"}
                    </h3>
                    {lead.rating && lead.rating > 0 && (
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium">{lead.rating.toFixed(1)}</span>
                        {lead.reviewsCount && lead.reviewsCount > 0 && (
                          <span className="text-amber-500/70 text-xs">({lead.reviewsCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                  {lead.category && (
                    <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-medium mb-3">
                      {lead.category}
                    </span>
                  )}
                  {lead.address && (
                    <p className="text-sm text-gray-500 mb-4 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      {lead.address}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    )}
                    {lead.website && (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No leads found for this search.</p>
            </div>
          )}
        </section>

        {/* News Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Industry News</h2>
              <p className="text-gray-500">{news.length} recent articles to keep you informed</p>
            </div>
          </div>

          {news.length > 0 ? (
            <div className="space-y-4">
              {news.slice(0, 5).map((article, i) => {
                const articleUrl = article.url || article.link
                const articleDate = article.published || article.date
                const articleSnippet = article.description || article.snippet

                return (
                  <motion.a
                    key={i}
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                          {article.title}
                        </h3>
                        {articleSnippet && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{articleSnippet}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-medium">
                            {article.source}
                          </span>
                          {articleDate && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(articleDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <ExternalLink className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </motion.a>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No news articles found.</p>
            </div>
          )}
        </section>

        {/* Events Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Networking Events</h2>
              <p className="text-gray-500">{events.length} upcoming opportunities to connect</p>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {events.slice(0, 8).map((event, i) => {
                const eventName = event.eventName || event.name || event.title || "Networking Event"
                const eventUrl = event.eventUrl || event.url
                const eventOrganizer = event.organizedByGroup || event.organizer
                const eventLocation = event.address || event.location

                return (
                  <motion.a
                    key={i}
                    href={eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block bg-white p-5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 group-hover:text-orange-700 transition-colors pr-2">
                        {eventName}
                      </h3>
                      {event.type && (
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0 ${
                          event.type === "PHYSICAL"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-violet-50 text-violet-700 border border-violet-200"
                        }`}>
                          {event.type === "PHYSICAL" ? "In-person" : "Online"}
                        </span>
                      )}
                    </div>
                    {event.date && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-orange-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-orange-700">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {eventLocation && (
                      <p className="text-sm text-gray-500 flex items-start gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        {eventLocation}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {eventOrganizer && (
                        <p className="text-xs text-gray-400">by {eventOrganizer}</p>
                      )}
                      {event.maxAttendees && event.maxAttendees > 0 && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <Users className="w-3.5 h-3.5" />
                          {event.actualAttendees || 0}/{event.maxAttendees}
                        </span>
                      )}
                    </div>
                  </motion.a>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No events found in your area.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
