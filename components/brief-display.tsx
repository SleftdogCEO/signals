"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import {
  Share2,
  Download,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  Star,
  MapPin,
  Calendar,
  Clock,
  Users2,
  ExternalLink,
  Ticket,
  Wifi,
  Coffee,
  Filter,
  Phone,
  Mail,
  Eye,
  BarChart3,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle,
  Newspaper,
} from "lucide-react"
import { useState, useEffect } from "react" // ADD useEffect
import Image from "next/image"
import LeafletMap from '@/components/ui/leaflet-map'

interface Lead {
  businessName: string
  contactPerson: string
  email: string | null
  phone: string | null
  website: string | null
  address: string
  rating: number
  reviewsCount: number
  category: string
  leadScore: number
  leadType: string
  contactReason: string
  priceLevel?: string
  openingHours?: any[]
  neighborhood?: string
  imageUrl?: string
  location?: { lat: number; lng: number }
  googleMapsUrl?: string
}

interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  sourceUrl: string
  published: string
  image?: string
  relevanceScore: number
  category: string
  sentiment: string
  keyInsights: string[]
  isRssLink?: boolean
  serperData?: {
    position: number
  }
  personalizedTags?: string[]
  personalizedFor?: string
  searchType: string
}

interface MeetupEvent {
  id: string
  title: string
  description: string
  date: string
  type: string
  address: string
  url: string
  organizer: string
  maxAttendees: number
  actualAttendees: number
  relevanceScore: number
  category: string
  // networkingValue: number
  personalizedReason: string
  actionableSteps: string[]
}

interface Brief {
  id: string
  businessName: string
  content: string
  createdAt: string
  businessData?: {
    competitors: Array<{
      title: string
      rating: number
      reviewsCount: number
      category: string
      address: string
      website?: string
      phone?: string
      imageUrl?: string
      priceLevel?: string
      openingHours?: any[]
      googleMapsUrl?: string
    }>
    leads: Lead[]
    marketAnalysis: {
      averageRating: string
      totalReviews: number
      saturation: string
      priceRange: string
      topCategories: Array<{ category: string; count: number }>
    }
  }
  newsData?: {
    articles: NewsArticle[]
    categorized: Record<string, NewsArticle[]>
    totalFound: number
    lastUpdated: string
    urlMetrics?: {
      directUrls: number
      rssUrls: number
    }
  }
  metadata: {
    industry: string
    location: string
    websiteUrl: string
  }
  meetupData?: {
    events: MeetupEvent[]
    categorized: Record<string, MeetupEvent[]>
    totalFound: number
    lastUpdated: string
    searchSummary: {
      keywords: string[]
      location: string
      industry: string
      hasCustomGoal: boolean
    }
  }
}

interface BriefDisplayProps {
  brief: Brief
}

//   const useBreakpoint = () => {
//   const { width } = useWindowSize()
//   return {
//     isMobile: width < 640,
//     isTablet: width >= 640 && width < 1024,
//     isDesktop: width >= 1024
//   }
// }

export default function BriefDisplay({ brief }: BriefDisplayProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"brief" | "leads" | "network" | "news" | "events" | "competitors">("brief")
  const [selectedLeadType, setSelectedLeadType] = useState<string>("all")
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>("all")
  const [selectedEventCategory, setSelectedEventCategory] = useState<string>("all")
    // const { isMobile, isTablet, isDesktop } = useBreakpoint()
  
  // Use these values to conditionally render content
  // const showFullContent = !isMobile
  // const gridColumns = isMobile ? 1 : isTablet ? 2 : 4
  
  // ADD: Client-side date formatting to fix hydration
  const [formattedDate, setFormattedDate] = useState<string>('')
  
  useEffect(() => {
    setFormattedDate(new Date(brief.createdAt).toLocaleDateString())
  }, [brief.createdAt])

  const handleJoinEliteNetwork = () => {
    router.push('/auth')
  }


  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }

  const formatContent = (content: string) => {
    const sections = content.split("## ")
    return sections
      .filter((section) => section.trim())
      .map((section, index) => {
        const lines = section.split("\n")
        const title = lines[0]
        const body = lines.slice(1).join("\n").trim()

        const getSectionData = (title: string) => {
          if (title.includes("Edge"))
            return {
              icon: <TrendingUp className="w-10 h-10 text-yellow-500" />,
              gradient: "from-yellow-500/20 via-yellow-400/10 to-orange-500/20",
              border: "border-yellow-500/30",
              bgPattern: "bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.1),transparent_50%)]",
            }
          if (title.includes("Leverage"))
            return {
              icon: <Zap className="w-10 h-10 text-blue-500" />,
              gradient: "from-blue-500/20 via-blue-400/10 to-purple-500/20",
              border: "border-blue-500/30",
              bgPattern: "bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]",
            }
          if (title.includes("Connections"))
            return {
              icon: <Users className="w-10 h-10 text-green-500" />,
              gradient: "from-green-500/20 via-green-400/10 to-emerald-500/20",
              border: "border-green-500/30",
              bgPattern: "bg-[radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.1),transparent_50%)]",
            }
          return {
            icon: <Star className="w-10 h-10 text-yellow-500" />,
            gradient: "from-yellow-500/20 to-yellow-600/20",
            border: "border-yellow-500/30",
            bgPattern: "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1),transparent_50%)]",
          }
        }

        const sectionData = getSectionData(title)

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="mb-12"
          >
            <Card
              className={`bg-gradient-to-br ${sectionData.gradient} border-2 ${sectionData.border} backdrop-blur-sm shadow-2xl overflow-hidden relative ${sectionData.bgPattern}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10" />
              <CardContent className="p-10 relative z-10">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-20 h-20 bg-black/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                    {sectionData.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-white mb-3">{title}</h2>
                    <div className="w-20 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-transparent rounded-full" />
                  </div>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-gray-100 leading-relaxed text-xl whitespace-pre-line font-medium tracking-wide">
                    {body}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })
  }

  const getSaturationColor = (saturation: string) => {
    switch (saturation.toLowerCase()) {
      case "high":
        return "text-red-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400 bg-green-500/20 border-green-500/30"
    if (score >= 60) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
    return "text-red-400 bg-red-500/20 border-red-500/30"
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="w-4 h-4 text-green-500" />
      case "negative":
        return <ThumbsDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredLeads =
    brief.businessData?.leads?.filter((lead) => selectedLeadType === "all" || lead.leadType === selectedLeadType) || []

  const filteredNews =
    selectedNewsCategory === "all"
      ? brief.newsData?.articles || []
      : brief.newsData?.categorized?.[selectedNewsCategory] || []

  const filteredEvents =
    selectedEventCategory === "all"
      ? brief.meetupData?.events || []
      : brief.meetupData?.categorized?.[selectedEventCategory] || []

  const leadTypes = [...new Set(brief.businessData?.leads?.map((lead) => lead.leadType) || [])]
  const newsCategories = Object.keys(brief.newsData?.categorized || {})
  const eventCategories = Object.keys(brief.meetupData?.categorized || {})

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' })
    }
  }

  const getEventTypeIcon = (type: string) => {
    return type === "ONLINE" ? <Wifi className="w-4 h-4" /> : <Coffee className="w-4 h-4" />
  }

  const getEventTypeColor = (type: string) => {
    return type === "ONLINE" 
      ? "border-blue-500/40 text-blue-400 bg-blue-500/10" 
      : "border-green-500/40 text-green-400 bg-green-500/10"
  }

  // Add these utility functions at the top


  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background - make it responsive */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-32 sm:w-64 h-32 sm:h-64 bg-green-500/5 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8">
        {/* Back button - responsive */}
        <div className="flex justify-start mb-4 sm:mb-8">
          <Button
            variant="outline"
            className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 px-3 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 font-semibold bg-black/60 backdrop-blur-sm shadow-lg transition-all text-sm sm:text-base"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 mr-1 sm:mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-4 mb-4 sm:mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />
            <span className="text-yellow-500 font-bold text-sm sm:text-lg">AI-Powered Strategy Brief</span>
            <Badge variant="outline" className="border-yellow-500/40 text-yellow-400 bg-yellow-500/10 text-xs sm:text-sm">
              Premium
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-4 sm:mb-8 bg-gradient-to-r from-white via-yellow-100 to-yellow-500 bg-clip-text text-transparent leading-tight">
            {brief.businessName}
          </h1>

          {/* Responsive badges grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-8">
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {brief.metadata.industry}
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {brief.metadata.location}
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {formattedDate || 'Loading...'}
            </Badge>
            {brief.businessData && (
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-500 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {brief.businessData.competitors.length} Competitors Analyzed
              </Badge>
            )}
            {brief.businessData?.leads && (
              <Badge variant="outline" className="border-green-500/40 text-green-500 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {brief.businessData.leads.length} Potential Partners
              </Badge>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent px-8 py-4 text-lg"
            >
              {copied ? <CheckCircle className="w-5 h-5 mr-2" /> : <Share2 className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Share Brief"}
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent px-8 py-4 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8 sm:mb-12 px-2 sm:px-0"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl sm:rounded-3xl p-2 sm:p-3 backdrop-blur-sm w-full sm:w-auto overflow-x-auto">
            <div className="flex gap-1 sm:gap-2 min-w-max">
              <button
                onClick={() => setActiveTab("brief")}
                className={`px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 sm:gap-3 whitespace-nowrap ${
                  activeTab === "brief"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                Strategy Brief
              </button>
              {brief.businessData?.leads && brief.businessData.leads.length > 0 && (
                <button
                  onClick={() => setActiveTab("leads")}
                  className={`px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 sm:gap-3 whitespace-nowrap ${
                    activeTab === "leads"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Potential Partners
                  <Badge className="bg-green-500 text-white text-xs">{brief.businessData.leads.length}</Badge>
                </button>
              )}
              {brief.meetupData && brief.meetupData.events.length > 0 && (
                <button
                  onClick={() => setActiveTab("network")} // Changed from "competitors" to "network"
                  className={`px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 sm:gap-3 whitespace-nowrap ${
                    activeTab === "network" // Changed from "competitors" to "network"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Users2 className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Changed icon from BarChart3 to Users2 */}
                  Network Opportunities
                  <Badge className="bg-purple-500 text-white text-xs">{brief.meetupData.events.length}</Badge>
                </button>
              )}
              {brief.businessData && brief.businessData.competitors.length > 0 && (
                <button
                  onClick={() => setActiveTab("competitors")}
                  className={`px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 sm:gap-3 whitespace-nowrap ${
                    activeTab === "competitors"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Market Analysis
                  <Badge className="bg-orange-500 text-white text-xs">{brief.businessData.competitors.length}</Badge>
                </button>
              )}
              {brief.newsData && brief.newsData.articles.length > 0 && (
                <button
                  onClick={() => setActiveTab("news")}
                  className={`px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 sm:gap-3 whitespace-nowrap ${
                    activeTab === "news"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
                  Business Intelligence
                  <Badge className="bg-blue-500 text-white text-xs">{brief.newsData.articles.length}</Badge>
                </button>
              )}
              {/* {brief.meetupData && brief.meetupData.events.length > 0 && (
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                    activeTab === "events"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Users2 className="w-5 h-5" />
                  Networking Events
                  <Badge className="bg-purple-500 text-white text-xs">{brief.meetupData.events.length}</Badge>
                </button>
              )} */}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "brief" && (
              <motion.div
                key="brief"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                {formatContent(brief.content)}
              </motion.div>
            )}

            {activeTab === "leads" && brief.businessData?.leads && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl mb-4 sm:mb-8">
                  <CardHeader className="p-4 sm:p-6 lg:p-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Strategic Partner Network</h2>
                        <p className="text-gray-400 text-base sm:text-lg">
                          Interactive map showing high-value connections and partnership opportunities
                        </p>
                        
                        {/* Enhanced metrics display */}
                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              <MapPin className="w-3 h-3 mr-1" />
                              Live Location Data
                            </Badge>
                          </div>
                          <span className="text-green-400">
                            ✓ {brief.businessData.leads.length} Partners Found
                          </span>
                          <span className="text-blue-400">
                            📊 {brief.businessData.leads.filter(l => l.leadScore >= 75).length} High Priority
                          </span>
                          <span className="text-purple-400">
                            🎯 Geographic Intelligence
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 lg:p-10">
                    {/* Interactive Map */}
                    <LeafletMap 
                      leads={brief.businessData.leads}
                      businessName={brief.businessName}
                      centerLocation={brief.businessData.leads[0]?.location}
                    />

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                      <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                        <div className="text-3xl font-bold text-green-500 mb-2">
                          {brief.businessData.leads.length}
                        </div>
                        <div className="text-gray-300 font-medium">Total Partners</div>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30">
                        <div className="text-3xl font-bold text-orange-500 mb-2">
                          {brief.businessData.leads.filter(l => l.leadScore >= 75).length}
                        </div>
                        <div className="text-gray-300 font-medium">High Priority</div>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30">
                        <div className="text-3xl font-bold text-blue-500 mb-2">
                          {Math.round(brief.businessData.leads.reduce((sum, l) => sum + l.leadScore, 0) / brief.businessData.leads.length)}%
                        </div>
                        <div className="text-gray-300 font-medium">Avg Score</div>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                        <div className="text-3xl font-bold text-purple-500 mb-2">
                          {new Set(brief.businessData.leads.map(l => l.category)).size}
                        </div>
                        <div className="text-gray-300 font-medium">Industries</div>
                      </div>
                    </div>

                    {/* Data Source Attribution */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-6 h-6 text-green-500" />
                          <div>
                            <h4 className="text-white font-semibold">Powered by Geographic Intelligence</h4>
                            <p className="text-gray-400 text-sm">
                              Real-time location data with interactive mapping • 
                              {brief.businessData.leads.filter(l => l.location).length} of {brief.businessData.leads.length} partners geo-located
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                          Map Data
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "network" && brief.meetupData && brief.meetupData.events.length > 0 && (
              <motion.div
                key="network"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                        <Users2 className="w-8 h-8 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-white">Strategic Network Opportunities</CardTitle>
                        <p className="text-gray-400 text-lg">
                          High-value networking events powered by Meetup data to grow your business connections
                        </p>
                        
                        {/* Enhanced metrics display */}
                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              <Calendar className="w-3 h-3 mr-1" />
                              Meetup.com Data
                            </Badge>
                          </div>
                          <span className="text-green-400">
                            ✓ {brief.meetupData.events.length} Events Found
                          </span>
                          <span className="text-blue-400">
                            📍 {brief.meetupData.searchSummary?.location}
                          </span>
                          <span className="text-purple-400">
                            🎯 {brief.meetupData.searchSummary?.keywords?.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Network Opportunities Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                      <div className="text-center p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border border-purple-500/30">
                        <div className="text-5xl font-bold text-purple-500 mb-3">
                          {brief.meetupData.events.length}
                        </div>
                        <div className="text-gray-300 font-medium">Available Events</div>
                      </div>

                      <div className="text-center p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl border border-blue-500/30">
                        <div className="text-5xl font-bold text-blue-500 mb-3">
                          {brief.meetupData.events.filter(e => e.type === "PHYSICAL").length}
                        </div>
                        <div className="text-gray-300 font-medium">In-Person Events</div>
                      </div>

                      <div className="text-center p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl border border-green-500/30">
                        <div className="text-5xl font-bold text-green-500 mb-3">
                          {brief.meetupData.events.filter(e => e.type === "ONLINE").length}
                        </div>
                        <div className="text-gray-300 font-medium">Online Events</div>
                      </div>

                      <div className="text-center p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl border border-yellow-500/30">
                        <div className="text-5xl font-bold text-yellow-500 mb-3">
                          {Math.round(brief.meetupData.events.reduce((sum, e) => sum + e.relevanceScore, 0) / brief.meetupData.events.length)}%
                        </div>
                        <div className="text-gray-300 font-medium">Avg Relevance</div>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <Users2 className="w-8 h-8 text-purple-500" />
                      Top Networking Opportunities for {brief.businessName}
                    </h3>

                    <div className="space-y-8">
                      {brief.meetupData.events.slice(0, 6).map((event, index) => {
                        const eventDateTime = formatEventDate(event.date)
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="border border-gray-700 rounded-3xl p-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-purple-500/30 transition-all duration-300 group"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex-1">
                                <h4 className="font-bold text-white text-2xl mb-3 group-hover:text-purple-400 transition-colors">
                                  {event.title}
                                </h4>
                                <div className="flex items-center gap-4 mb-4">
                                  <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10">
                                    {event.category}
                                  </Badge>
                                  <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                    {getEventTypeIcon(event.type)}
                                    <span className="ml-1">{event.type === "PHYSICAL" ? "In-Person" : "Online"}</span>
                                  </Badge>
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    {event.relevanceScore}% Match
                                  </Badge>
                                </div>
                                <p className="text-gray-300 mb-6 leading-relaxed">{event.description}</p>
                              </div>
                            </div>

                            {/* Event Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{eventDateTime.dayOfWeek}</p>
                                  <p className="text-gray-400 text-sm">{eventDateTime.date}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{eventDateTime.time}</p>
                                  <p className="text-gray-400 text-sm">Local Time</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{event.actualAttendees}/{event.maxAttendees}</p>
                                  <p className="text-gray-400 text-sm">Attendees</p>
                                </div>
                              </div>
                            </div>

                            {/* Location and Organizer */}
                            <div className="flex items-start gap-3 mb-6">
                              <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-white font-medium">{event.organizer}</p>
                                <p className="text-gray-400 text-sm">{event.address}</p>
                              </div>
                            </div>

                            {/* Personalized Reason */}
                            {event.personalizedReason && (
                              <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
                                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-purple-500" />
                                  Why This Event is Perfect for {brief.businessName}
                                </h4>
                                <p className="text-gray-300 leading-relaxed">{event.personalizedReason}</p>
                              </div>
                            )}

                            {/* Action Steps */}
                            {event.actionableSteps && event.actionableSteps.length > 0 && (
                              <div className="bg-purple-500/10 rounded-2xl p-6 mb-6 border border-purple-500/20">
                                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                                  <Rocket className="w-4 h-4 text-purple-500" />
                                  Strategic Action Steps
                                </h4>
                                <div className="space-y-2">
                                  {event.actionableSteps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-purple-400 text-sm font-bold">{i + 1}</span>
                                      </div>
                                      <p className="text-gray-300">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Separator className="my-6 bg-gray-700" />

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center">
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Add to Calendar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </div>
                              {event.url && event.url !== "#" ? (
                                <Button
                                  asChild
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                                >
                                  <a 
                                    href={event.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      console.log(`User clicked network event: ${event.title} from meetupService`)
                                    }}
                                  >
                                    <Ticket className="w-4 h-4 mr-2" />
                                    Join Event
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </a>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                  onClick={() => {
                                    window.open(`https://www.meetup.com/find/?keywords=${encodeURIComponent(event.title)}`, '_blank')
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Find on Meetup
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Data Source Attribution */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users2 className="w-6 h-6 text-purple-500" />
                          <div>
                            <h4 className="text-white font-semibold">Powered by Meetup Network Intelligence</h4>
                            <p className="text-gray-400 text-sm">
                              Live networking data from {brief.meetupData.searchSummary?.keywords?.length || 0} targeted searches • 
                              Updated: {new Date(brief.meetupData.lastUpdated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Meetup Data
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "competitors" && brief.businessData && (
              <motion.div
                key="competitors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl mb-4 sm:mb-8">
                  <CardHeader className="p-4 sm:p-6 lg:p-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Market Intelligence Dashboard</h2>
                        <p className="text-gray-400 text-base sm:text-lg">Comprehensive analysis of your competitive landscape</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 lg:p-10">
                    {/* Responsive grid for stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
                      <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl border border-yellow-500/30">
                        <div className="text-5xl font-bold text-yellow-500 mb-3">
                          {brief.businessData.marketAnalysis.averageRating}
                        </div>
                        <div className="text-gray-300 font-medium mb-3">Average Rating</div>
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(Number.parseFloat(brief.businessData!.marketAnalysis.averageRating))
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl border border-blue-500/30">
                        <div className="text-5xl font-bold text-blue-500 mb-3">
                          {brief.businessData.marketAnalysis.totalReviews.toLocaleString()}
                        </div>
                        <div className="text-gray-300 font-medium">Total Reviews</div>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl border border-green-500/30">
                        <div
                          className={`text-5xl font-bold mb-3 ${getSaturationColor(brief.businessData.marketAnalysis.saturation)}`}
                        >
                          {brief.businessData.marketAnalysis.saturation}
                        </div>
                        <div className="text-gray-300 font-medium">Market Saturation</div>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border border-purple-500/30">
                        <div className="text-5xl font-bold text-purple-500 mb-3">
                          {brief.businessData.marketAnalysis.priceRange || "$$"}
                        </div>
                        <div className="text-gray-300 font-medium">Price Range</div>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-yellow-500" />
                      Top Local Network Analysis
                    </h3>

                    <div className="grid gap-8">
                      {brief.businessData.competitors.slice(0, 5).map((competitor, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-3xl p-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-yellow-500/30 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-6 flex-1">
                              {competitor.imageUrl && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-600">
                                  <Image
                                    src={competitor.imageUrl || "/placeholder.svg"}
                                    alt={competitor.title}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-white text-2xl mb-2">{competitor.title}</h4>
                                <div className="flex items-center gap-4 mb-3">
                                  <Badge
                                    variant="outline"
                                    className="border-yellow-500/40 text-yellow-500 bg-yellow-500/10"
                                  >
                                    {competitor.category}
                                  </Badge>
                                  {competitor.priceLevel && (
                                    <Badge
                                      variant="outline"
                                      className="border-green-500/40 text-green-400 bg-green-500/10"
                                    >
                                      {competitor.priceLevel}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm flex items-center gap-2 mb-4">
                                  <MapPin className="w-4 h-4" />
                                  {competitor.address}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                <span className="text-yellow-500 font-bold text-2xl">{competitor.rating}</span>
                              </div>
                              <p className="text-gray-400 text-sm">({competitor.reviewsCount} reviews)</p>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-6 border-t border-gray-700">
                            {competitor.website && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                              >
                                <a 
                                  href={competitor.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    console.log(`User visited competitor website: ${competitor.title} - ${competitor.website}`)
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Website
                                </a>
                              </Button>
                            )}
                            {competitor.phone && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                              >
                                <a href={`tel:${competitor.phone}`}>
                                  <Phone className="w-4 h-4 mr-2" />
                                  {competitor.phone}
                                </a>
                              </Button>
                            )}
                            {competitor.googleMapsUrl && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-blue-600 text-blue-300 hover:text-white bg-transparent"
                              >
                                <a 
                                  href={competitor.googleMapsUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <MapPin className="w-4 h-4 mr-2" />
                                  View on Maps
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Analyze
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "news" && brief.newsData && (
              <motion.div
                key="news"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold text-white">Real-Time Business Intelligence</CardTitle>
                          <p className="text-gray-400 text-lg">Latest trends, insights, and market developments</p>
                          
                          {/* ENHANCED METRICS DISPLAY */}
                          <div className="flex items-center gap-6 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Google Serper API
                              </Badge>
                            </div>
                            <span className="text-green-400">
                              ✓ {brief.newsData.articles.length} Direct Articles
                            </span>
                            <span className="text-blue-400">
                              📊 {brief.newsData.totalFound} Total Found
                            </span>
                            <span className="text-purple-400">
                              🎯 Real-time Results
                            </span>
                          </div>
                        </div>
                      </div>
                      {newsCategories.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-400" />
                          <select
                            value={selectedNewsCategory}
                            onChange={(e) => setSelectedNewsCategory(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="all">All Categories</option>
                            {newsCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {filteredNews.map((article, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-3xl p-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-blue-500/30 transition-all duration-300 group"
                        >
                          <div className="flex gap-6">
                            {article.image && (
                              <div className="w-32 h-32 rounded-2xl overflow-hidden border border-gray-600 flex-shrink-0">
                                <Image
                                  src={article.image || "/placeholder.svg"}
                                  alt={article.title}
                                  width={128}
                                  height={128}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">
                                    {article.category}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {getSentimentIcon(article.sentiment)}
                                    <span className="text-sm text-gray-400 capitalize">{article.sentiment}</span>
                                  </div>
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    Score: {article.relevanceScore}
                                  </Badge>
                                  
                                  {/* ENHANCED SERPER INDICATORS */}
                                  <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/10">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Live Result
                                  </Badge>
                                  
                                  {/* SHOW GOOGLE RANKING POSITION */}
                                  {article.serperData?.position && (
                                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                      #{article.serperData.position} Ranked
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* ENHANCED CLICKABLE TITLE */}
                              {article.url && article.url !== "#" ? (
                                <a 
                                  href={article.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    console.log(`User clicked article: ${article.title} - ${article.url}`)
                                    console.log(`Source: ${article.source}, Position: ${article.serperData?.position}`)
                                  }}
                                  className="block"
                                >
                                  <h3 className="font-bold text-white text-xl mb-4 leading-tight group-hover:text-blue-400 transition-colors cursor-pointer flex items-start gap-2">
                                    {article.title}
                                    <ExternalLink className="w-4 h-4 opacity-60 flex-shrink-0 mt-1" />
                                  </h3>
                                </a>
                              ) : (
                                <h3 className="font-bold text-white text-xl mb-4 leading-tight">
                                  {article.title}
                                </h3>
                              )}

                              <p className="text-gray-300 mb-4 leading-relaxed">{article.description}</p>

                              {/* ENHANCED KEY INSIGHTS */}
                              {article.keyInsights.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {article.keyInsights.map((insight, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="border-purple-500/40 text-purple-400 bg-purple-500/10"
                                    >
                                      <Lightbulb className="w-3 h-3 mr-1" />
                                      {insight}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* ENHANCED PERSONALIZATION TAGS */}
                              {article.personalizedTags && article.personalizedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {article.personalizedTags.map((tag, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10 text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                    <Newspaper className="w-3 h-3" />
                                    {article.source}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(article.published).toLocaleDateString()}
                                  </span>
                                  {/* SHOW SEARCH TYPE */}
                                  <span className="text-purple-400 text-xs">
                                    {article.searchType.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                </div>
                                
                                {/* ENHANCED READ ARTICLE BUTTON */}
                                {article.url && article.url !== "#" ? (
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-600 text-blue-300 hover:text-white hover:bg-blue-600/20 bg-transparent"
                                  >
                                    <a 
                                      href={article.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      onClick={() => {
                                        console.log(`User clicked read article: ${article.title}`)
                                        console.log(`Direct URL: ${article.url}`)
                                        console.log(`Google position: ${article.serperData?.position}`)
                                      }}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Read Full Article
                                  </a>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-600 text-gray-500 bg-transparent cursor-not-allowed"
                                    disabled
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Link Unavailable
                                  </Button>
                                )}
                              </div>

                              {/* ENHANCED SOURCE LINK */}
                              {article.sourceUrl && article.sourceUrl !== article.url && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-500 hover:text-gray-300 p-0 h-auto"
                                    >
                                      <a 
                                        href={article.sourceUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs"
                                      >
                                        <Newspaper className="w-3 h-3" />
                                        Visit {article.source}
                                      </a>
                                    </Button>
                                    
                                    {/* SHOW PERSONALIZATION SCORE */}
                                    {article.personalizedFor && (
                                      <div className="text-xs text-gray-500">
                                        Personalized for: {article.personalizedFor}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* ENHANCED API STATUS FOOTER */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-2xl border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <div>
                            <h4 className="text-white font-semibold">Powered by Google Serper API</h4>
                            <p className="text-gray-400 text-sm">
                              Real-time news data with direct article links • Updated: {new Date(brief.newsData.lastUpdated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                          Live Data
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "events" && brief.meetupData && (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                          <Users2 className="w-8 h-8 text-purple-500" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold text-white">Networking Events & Meetups</CardTitle>
                          <p className="text-gray-400 text-lg">
                            Strategic networking opportunities to grow your business connections
                          </p>
                        </div>
                      </div>
                      {eventCategories.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-400" />
                          <select
                            value={selectedEventCategory}
                            onChange={(e) => setSelectedEventCategory(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="all">All Categories</option>
                            {eventCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {filteredEvents.map((event, index) => {
                        const eventDateTime = formatEventDate(event.date)
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="border border-gray-700 rounded-3xl p-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-purple-500/30 transition-all duration-300 group"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="font-bold text-white text-2xl mb-3 group-hover:text-purple-400 transition-colors">
                                      {event.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mb-4">
                                      <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10">
                                        {event.category}
                                      </Badge>
                                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                        {getEventTypeIcon(event.type)}
                                        <span className="ml-1">{event.type.replace('_', ' ')}</span>
                                      </Badge>
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        {event.relevanceScore}% Match
                                      </Badge>
                                    </div>
                                  </div>
                                  {/* <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-500 mb-1">
                                      ${event.networkingValue.toLocaleString()}
                                    </div>
                                    <p className="text-gray-400 text-sm">Networking Value</p>
                                  </div> */}
                                </div>

                                <p className="text-gray-300 mb-6 leading-relaxed">{event.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                      <Calendar className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">{eventDateTime.dayOfWeek}</p>
                                      <p className="text-gray-400 text-sm">{eventDateTime.date}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                      <Clock className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">{eventDateTime.time}</p>
                                      <p className="text-gray-400 text-sm">Local Time</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                                      <Users className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">{event.actualAttendees}/{event.maxAttendees}</p>
                                      <p className="text-gray-400 text-sm">Attendees</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3 mb-6">
                                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="text-white font-medium">{event.organizer}</p>
                                    <p className="text-gray-400 text-sm">{event.address}</p>
                                  </div>
                                </div>

                                <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
                                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-500" />
                                    Why This Event is Perfect for You
                                  </h4>
                                  <p className="text-gray-300 leading-relaxed">{event.personalizedReason}</p>
                                </div>

                                {event.actionableSteps.length > 0 && (
                                  <div className="bg-purple-500/10 rounded-2xl p-6 mb-6 border border-purple-500/20">
                                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                                      <Rocket className="w-4 h-4 text-purple-500" />
                                      Action Steps
                                    </h4>
                                    <div className="space-y-2">
                                      {event.actionableSteps.map((step, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                          <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-purple-400 text-sm font-bold">{i + 1}</span>
                                          </div>
                                          <p className="text-gray-300">{step}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator className="my-6 bg-gray-700" />

                            <div className="flex justify-between items-center">
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Add to Calendar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  View Attendees
                                </Button>
                              </div>
                              {event.url && event.url !== "#" && (
                                <Button
                                  asChild
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                                >
                                  <a 
                                    href={event.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center"
                                  >
                                    <Ticket className="w-4 h-4 mr-2" />
                                    Register Now
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </a>
                                </Button>
                              )}
                              {/* If no URL available, show alternative */}
                              {(!event.url || event.url === "#") && (
                                <Button
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                  onClick={() => {
                                    window.open(`https://www.meetup.com/find/?keywords=${encodeURIComponent(event.title)}`, '_blank')
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Find on Meetup
                                </Button>
                              ) }
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

     // Update the CTA section
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="text-center mt-8 sm:mt-20"
    >
      <Card className="bg-gradient-to-br from-yellow-500/10 via-yellow-600/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-sm shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
        <CardContent className="p-6 sm:p-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 sm:mb-8">
              <Rocket className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />
              <h3 className="text-3xl sm:text-5xl font-bold text-white text-center sm:text-left">Ready to Dominate Your Market?</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleJoinEliteNetwork}
                className="w-full sm:w-auto px-6 py-3 text-lg font-semibold rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Join the Elite Network
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto px-6 py-3 text-lg font-semibold rounded-full border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Strategy Brief
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
      </div>
    </div>
  )
}

// function useWindowSize(): { width: any } {
//   throw new Error("Function not implemented.")
// }


