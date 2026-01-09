"use client"

import { useEffect, useState, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Stethoscope,
  Loader2,
  Users,
  MessageSquare,
  Star,
  Zap,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  ThumbsUp,
  Lightbulb,
  DollarSign,
  Megaphone,
  Cpu,
  ExternalLink,
  Lock,
  Crown,
  Target,
  ChevronRight,
  Eye,
  MapPin,
  Calendar,
  Handshake,
  Brain,
  BarChart3,
  BookOpen,
  Globe,
  Bot,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Types
interface Post {
  id: string
  title: string
  content: string
  category: string
  upvotes: number
  comment_count: number
  view_count: number
  created_at: string
  is_pinned: boolean
  is_featured: boolean
  provider: {
    id: string
    practice_name: string
    specialty: string
    location: string
  }
}

interface Review {
  id: string
  product_name: string
  vendor_name: string | null
  review_type: string
  overall_rating: number
  title: string
  review_content: string
  would_recommend: boolean
  helpful_count: number
  created_at: string
  provider: {
    practice_name: string
    specialty: string
  }
}

interface Intelligence {
  id: string
  title: string
  summary: string
  category: string
  source_url: string | null
  source_name: string | null
  relevance_score: number
  created_at: string
}

interface ProviderInfo {
  id: string
  practice_name: string
  specialty: string
  location: string
  subscription_status: string
}

interface PartnerMatch {
  id: string
  practice_name: string
  specialty: string
  location: string
  match_score: number
  why_match: string[]
  address?: string
  phone?: string
  website?: string
  rating?: number
  review_count?: number
}

// Category config with better icons
const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: Sparkles, color: 'blue' },
  { id: 'software', label: 'Software', icon: Cpu, color: 'violet' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, color: 'pink' },
  { id: 'payment_processing', label: 'Billing', icon: DollarSign, color: 'emerald' },
  { id: 'ai_tools', label: 'AI Tools', icon: Brain, color: 'amber' },
  { id: 'practice_management', label: 'Operations', icon: BarChart3, color: 'cyan' },
]

// Tab items shown at top
const TAB_ITEMS = [
  { id: 'partners', label: 'Partner Matches', icon: Handshake, gradient: 'from-blue-500 to-cyan-400', description: 'Real local practices to partner with' },
  { id: 'community', label: 'Community', icon: MessageSquare, gradient: 'from-violet-500 to-purple-400', description: 'Insights from other practices' },
  { id: 'insights', label: 'Your Insights', icon: BookOpen, gradient: 'from-emerald-500 to-teal-400', description: 'Curated tips for your specialty' },
  { id: 'consulting', label: 'AI Growth Consulting', icon: Zap, gradient: 'from-amber-500 to-orange-400', description: 'We build tools for your practice' },
]

function NetworkHubContent() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  // State
  const [activeTab, setActiveTab] = useState<'partners' | 'community' | 'insights' | 'consulting'>('partners')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Check for success redirect from payment
  useEffect(() => {
    const success = searchParams.get('success')
    const isTest = searchParams.get('test')
    if (success === 'true') {
      setShowSuccessMessage(true)
      toast.success(isTest ? 'Test subscription activated!' : 'Subscription activated! Welcome to Warm Introductions.')
      // Clear the URL params
      window.history.replaceState({}, '', '/dashboard/network/hub')
    }
  }, [searchParams])
  const [posts, setPosts] = useState<Post[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [intelligence, setIntelligence] = useState<Intelligence[]>([])
  const [partnerMatches, setPartnerMatches] = useState<PartnerMatch[]>([])
  const [provider, setProvider] = useState<ProviderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreatePost, setShowCreatePost] = useState(false)

  const isSubscribed = provider?.subscription_status === 'active'
  const isTrial = provider?.subscription_status === 'trial'
  const hasAccess = isSubscribed || isTrial

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/dashboard/network/hub")
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading, router])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load provider info
      const providerRes = await fetch(`/api/network/profile?userId=${user?.id}`)
      if (providerRes.ok) {
        const { provider: providerData } = await providerRes.json()
        setProvider(providerData)
      }

      // Load partner matches
      const matchesRes = await fetch(`/api/network/discover?userId=${user?.id}`)
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json()
        setPartnerMatches(matchesData.matches || [])
      }

      // Load all data in parallel
      const [postsRes, reviewsRes, intelligenceRes] = await Promise.all([
        fetch('/api/network/posts?limit=6'),
        fetch('/api/network/reviews?limit=4'),
        fetch(`/api/network/intelligence?userId=${user?.id}`)
      ])

      if (postsRes.ok) {
        const { posts: postsData } = await postsRes.json()
        setPosts(postsData || [])
      }

      if (reviewsRes.ok) {
        const { reviews: reviewsData } = await reviewsRes.json()
        setReviews(reviewsData || [])
      }

      if (intelligenceRes.ok) {
        const { intelligence: intelligenceData } = await intelligenceRes.json()
        setIntelligence(intelligenceData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load network data')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Stethoscope className="w-10 h-10 text-white" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Loading Your Network</h2>
            <p className="text-slate-400">Finding partners and insights...</p>
          </div>
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white hidden sm:block">Sleft Health</h1>
            </Link>

            <div className="flex items-center gap-3">
              {hasAccess ? (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-400">
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">{isSubscribed ? 'Pro' : 'Trial'}</span>
                </span>
              ) : (
                <Link
                  href="/dashboard/network/upgrade"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Unlock</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Always Visible */}
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-white/20' : 'bg-slate-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.label}</h3>
                    <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">

          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <motion.div
              key="partners"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center py-10 lg:py-14">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                  <Handshake className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-[1.1]">
                  Find Your
                  <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Perfect Partners
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-6">
                  Real healthcare practices in {provider?.location || 'your area'} looking to build referral relationships.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400">
                    {partnerMatches.length} Partners Found
                  </span>
                  <span className="px-3 py-1.5 bg-slate-800 rounded-full text-sm text-slate-400">
                    {provider?.specialty || 'Healthcare'}
                  </span>
                </div>
              </div>

              {/* Warm Intros CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-blue-500/20 rounded-2xl p-6 lg:p-8"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 flex-shrink-0">
                    <Handshake className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">Ready for us to introduce you?</h3>
                    <p className="text-slate-400">
                      We'll reach out to partners on your behalf, schedule meetings, and make sure it's a mutual fit. No cold outreach needed.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/network/upgrade"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25 whitespace-nowrap"
                  >
                    Get Warm Intros — $250/mo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Partner Cards */}
              {partnerMatches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Handshake className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Searching for Partners</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    We're finding healthcare practices in your area. This may take a moment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {partnerMatches.slice(0, 6).map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate pr-4">
                            {match.practice_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
                              {match.specialty}
                            </span>
                            {match.rating && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                {match.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-black text-white">{match.match_score}</span>
                        </div>
                      </div>

                      {match.address && (
                        <p className="text-sm text-slate-500 flex items-start gap-1.5 mb-3">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{match.address}</span>
                        </p>
                      )}

                      {/* Why match */}
                      <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-emerald-400 font-medium mb-1">Why partner?</p>
                        <p className="text-sm text-slate-300">{match.why_match[0]}</p>
                      </div>

                      {/* Actions */}
                      {hasAccess && match.website ? (
                        <a
                          href={match.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Visit Website
                        </a>
                      ) : hasAccess && match.phone ? (
                        <a
                          href={`tel:${match.phone}`}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          Contact Practice
                        </a>
                      ) : (
                        <Link
                          href="/dashboard/network/upgrade"
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-800 text-slate-400 text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                          Unlock Contact Info
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

            </motion.div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center py-10 lg:py-14">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/30">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-[1.1]">
                  Learn From
                  <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Other Practices
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-6">
                  Real insights from real healthcare professionals. What's working, what's not, and what to try next.
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
                >
                  <Plus className="w-5 h-5" />
                  Share an Insight
                </button>
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap justify-center gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>

              {/* Posts */}
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Be the First</h3>
                  <p className="text-slate-400 mb-4">Share what's working in your practice.</p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Create Post
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts
                    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
                    .slice(0, 4)
                    .map((post, index) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-slate-400">
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold text-slate-400">{post.upvotes}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-medium text-slate-300 capitalize">
                                {post.category.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-500">{formatTimeAgo(post.created_at)}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {post.comment_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {post.view_count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center py-10 lg:py-14">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-[1.1]">
                  Insights For
                  <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {provider?.specialty || 'Your Practice'}
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-6">
                  Curated tips and strategies specifically for your specialty. No fluff, just what works.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-400">
                    {intelligence.length} Insights Available
                  </span>
                </div>
              </div>

              {intelligence.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Loading Insights</h3>
                  <p className="text-slate-400">Finding relevant content for your practice.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {intelligence.slice(0, 6).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded capitalize">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          {item.relevance_score}%
                        </div>
                      </div>
                      <h4 className="text-base font-bold text-white mb-2 line-clamp-2">{item.title}</h4>
                      <p className="text-sm text-slate-400 line-clamp-3">{item.summary}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                        <span className="text-xs text-slate-500">{item.source_name || 'Sleft Health'}</span>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Consulting Tab */}
          {activeTab === 'consulting' && (
            <motion.div
              key="consulting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center py-10 lg:py-14">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/30">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-[1.1]">
                  Your Practice Deserves
                  <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    A Tech Team
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                  We're a team of AI engineers, healthcare marketers, and developers who build the tools that help practices grow.
                </p>
                <a
                  href="https://calendly.com/sleft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity shadow-xl shadow-amber-500/25"
                >
                  <Calendar className="w-5 h-5" />
                  Book a Free Strategy Call
                </a>
              </div>

              {/* Services Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Globe, title: 'Custom Websites', description: 'High-converting, HIPAA-aware sites built for healthcare', gradient: 'from-blue-500 to-cyan-400' },
                  { icon: Bot, title: 'AI Assistants', description: '24/7 patient engagement without adding staff', gradient: 'from-violet-500 to-purple-400' },
                  { icon: Target, title: 'Patient Funnels', description: 'Turn visitors into booked appointments', gradient: 'from-emerald-500 to-teal-400' },
                  { icon: Megaphone, title: 'Marketing Systems', description: 'Google Ads, social, and content that works', gradient: 'from-pink-500 to-rose-400' },
                  { icon: Cpu, title: 'AI Documentation', description: 'Reduce charting time by 70%', gradient: 'from-amber-500 to-orange-400' },
                  { icon: BarChart3, title: 'Practice Analytics', description: 'Know exactly what\'s working', gradient: 'from-cyan-500 to-blue-400' },
                ].map((service, index) => {
                  const ServiceIcon = service.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-4`}>
                        <ServiceIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                      <p className="text-sm text-slate-400">{service.description}</p>
                    </motion.div>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-3">Have an idea? Let's build it.</h3>
                <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                  Tell us what you need — a custom tool, a website, a marketing system — and we'll make it happen.
                </p>
                <Link
                  href="/dashboard/consulting"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Submit a Project Request
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal
            userId={user?.id || ''}
            onClose={() => setShowCreatePost(false)}
            onSuccess={(post) => {
              setPosts([post, ...posts])
              setShowCreatePost(false)
              toast.success('Posted!')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Create Post Modal Component
function CreatePostModal({
  userId,
  onClose,
  onSuccess
}: {
  userId: string
  onClose: () => void
  onSuccess: (post: Post) => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/network/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, content, category })
      })

      if (res.ok) {
        const { post } = await res.json()
        onSuccess(post)
      } else {
        const { error } = await res.json()
        toast.error(error || 'Failed to create post')
      }
    } catch (error) {
      toast.error('Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-6">Share an Insight</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
            >
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your insight about?"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Details</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what's working..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 px-4 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function NetworkHubPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <NetworkHubContent />
    </Suspense>
  )
}
