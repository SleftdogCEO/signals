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
  Plus
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
  const { user } = useAuth()
  const [briefs, setBriefs] = useState<SavedBrief[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState("")

  // Fetch user briefs
  const fetchUserBriefs = async () => {
    if (!user?.id) {
      console.log("No user ID available")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")
      console.log("Fetching briefs for user:", user.id)
      
      const response = await fetch(
        `/api/user-briefs/${user.id}?page=${currentPage}&limit=10`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Briefs API response:", data)

      if (data.success) {
        setBriefs(data.briefs || [])
        setTotalPages(data.pagination?.pages || 0)
        console.log("Loaded briefs:", data.briefs?.length || 0)
      } else {
        throw new Error(data.error || "Failed to fetch briefs")
      }
    } catch (error) {
      console.error('Error fetching briefs:', error)
      setError(error instanceof Error ? error.message : "Failed to load briefs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserBriefs()
  }, [user, currentPage])

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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Please log in to view your briefs.</p>
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
          <Link href="/generate">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Generate New Brief
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your strategy briefs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBriefs.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800"
          >
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No briefs found" : "No strategy briefs yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Generate your first AI-powered business intelligence brief to get started"
              }
            </p>
            {!searchTerm && (
              <Link href="/generate">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Brief
                </Button>
              </Link>
            )}
          </motion.div>
        )}

        {/* Briefs Grid */}
        {!loading && !error && filteredBriefs.length > 0 && (
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