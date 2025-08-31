"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Calendar, 
  Building2, 
  MapPin, 
  Eye, 
  Trash2, 
  Download,
  Search,
  Filter,
  Plus,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/Dashboard/DashboardLayout"
import Link from "next/link"
import { motion } from 'framer-motion'

interface SavedBrief {
  id: string
  business_name: string
  metadata: {
    industry: string
    location: string
    generatedAt: string
  }
  created_at: string
  brief_status: string
  form_data?: {
    customGoal?: string
  }
}

export default function MyBriefsPage() {
  const { user, loading: authLoading } = useAuth()
  const [briefs, setBriefs] = useState<SavedBrief[]>([])
  const [loading, setLoading] = useState(false) // Changed: Don't load initially
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState("")
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false) // Track if we've tried loading

  // Fetch user briefs
  const fetchUserBriefs = async () => {
    if (!user?.id) {
      console.log("No user ID available")
      setLoading(false)
      setHasAttemptedLoad(true)
      return
    }

    try {
      setLoading(true)
      setError("")
      setHasAttemptedLoad(true)
      console.log("Fetching briefs for user:", user.id)
      
      const response = await fetch(
        `/api/user-briefs/${user.id}?page=${currentPage}&limit=10`
      )
      
      if (!response.ok) {
        if (response.status === 404) {
          // User not found or no briefs - this is normal for new users
          setBriefs([])
          setTotalPages(0)
          console.log("No briefs found for user (this is normal for new users)")
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Briefs API response:", data)

      if (data.success) {
        setBriefs(data.briefs || [])
        setTotalPages(data.pagination?.pages || 0)
        console.log("Loaded briefs:", data.briefs?.length || 0)
      } else {
        // Handle case where API returns success: false but no error
        if (data.error) {
          throw new Error(data.error)
        } else {
          // No error, just no briefs (new user)
          setBriefs([])
          setTotalPages(0)
          console.log("No briefs found for this user")
        }
      }
    } catch (error) {
      console.error('Error fetching briefs:', error)
      setError(error instanceof Error ? error.message : "Failed to load briefs")
    } finally {
      setLoading(false)
    }
  }

  // Only fetch when user is available and authenticated
  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchUserBriefs()
    } else if (!authLoading && !user) {
      setHasAttemptedLoad(true)
    }
  }, [user, currentPage, authLoading])

  const filteredBriefs = briefs.filter(brief =>
    brief.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brief.metadata?.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDeleteBrief = async (briefId: string) => {
    try {
      const response = await fetch(`/api/briefs/${briefId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      })

      if (response.ok) {
        setBriefs(briefs.filter(brief => brief.id !== briefId))
      }
    } catch (error) {
      console.error('Error deleting brief:', error)
    }
  }

  // Show loading during authentication
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Authenticating...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 max-w-md mx-auto">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
            <p className="text-gray-400 mb-6">Please log in to view your strategy briefs.</p>
            <Link href="/auth">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Strategy Briefs</h1>
            <p className="text-gray-400 mt-2">
              Manage your generated business intelligence reports
            </p>
          </div>
          <Link href="/dashboard/generate">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Generate New Brief
            </Button>
          </Link>
        </div>

        {/* Search and Filters - Only show if user has briefs */}
        {hasAttemptedLoad && briefs.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by business name or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button variant="outline" className="border-gray-700 text-gray-300">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
            <Button 
              onClick={fetchUserBriefs}
              className="mt-2 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading State - Only show when actively loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your strategy briefs...</p>
          </div>
        )}

        {/* Empty State - Enhanced for different scenarios */}
        {!loading && !error && hasAttemptedLoad && filteredBriefs.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-800"
          >
            {searchTerm ? (
              // No search results
              <>
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No briefs found</h3>
                <p className="text-gray-400 mb-6">
                  No briefs match your search for "{searchTerm}". Try different keywords.
                </p>
                <Button 
                  onClick={() => setSearchTerm("")}
                  variant="outline" 
                  className="border-gray-700 text-gray-300"
                >
                  Clear Search
                </Button>
              </>
            ) : briefs.length === 0 ? (
              // New user with no briefs
              <>
                <div className="relative mb-6">
                  <Sparkles className="w-16 h-16 text-yellow-500 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">!</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Welcome to Sleft Signals!</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                  You haven't generated any strategy briefs yet. Create your first AI-powered business intelligence report to discover valuable insights and opportunities.
                </p>
                <div className="space-y-4">
                  <Link href="/generate">
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create Your First Brief
                    </Button>
                  </Link>
                  <div className="text-gray-500 text-sm">
                    <p>✨ AI-powered market analysis</p>
                    <p>🎯 Strategic partnership opportunities</p>
                    <p>📊 Competitive intelligence insights</p>
                  </div>
                </div>
              </>
            ) : (
              // All briefs filtered out
              <>
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">All briefs filtered</h3>
                <p className="text-gray-400 mb-6">
                  You have {briefs.length} brief{briefs.length !== 1 ? 's' : ''}, but none match your current search.
                </p>
                <Button 
                  onClick={() => setSearchTerm("")}
                  variant="outline" 
                  className="border-gray-700 text-gray-300"
                >
                  Show All Briefs
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Briefs Grid */}
        {!loading && !error && filteredBriefs.length > 0 && (
          <>
            {/* Results counter when searching */}
            {searchTerm && (
              <div className="text-sm text-gray-400">
                Found {filteredBriefs.length} of {briefs.length} brief{briefs.length !== 1 ? 's' : ''}
              </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBriefs.map((brief, index) => (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-yellow-400 transition-colors">
                        {brief.business_name}
                      </h3>
                      <div className="space-y-1">
                        {brief.metadata?.industry && (
                          <div className="flex items-center text-sm text-gray-400">
                            <Building2 className="w-4 h-4 mr-2" />
                            {brief.metadata.industry}
                          </div>
                        )}
                        {brief.metadata?.location && (
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {brief.metadata.location}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(brief.created_at)}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={brief.brief_status === 'completed' ? 'default' : 'secondary'}
                      className="bg-green-900/20 text-green-400 border-green-700"
                    >
                      {brief.brief_status}
                    </Badge>
                  </div>

                  {brief.form_data?.customGoal && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      Goal: {brief.form_data.customGoal}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/dashboard/briefs/${brief.id}`} className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Brief
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-gray-700 text-gray-300 hover:bg-red-900/20 hover:border-red-700 hover:text-red-400"
                      onClick={() => handleDeleteBrief(brief.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="border-gray-700 text-gray-300"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="border-gray-700 text-gray-300"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}