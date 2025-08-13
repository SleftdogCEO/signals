"use client"

import DashboardLayout from "@/components/Dashboard/DashboardLayout"
import DashboardStats from "@/components/Dashboard/DashboardStats"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [briefsCount, setBriefsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch user briefs count
  useEffect(() => {
    const fetchBriefsCount = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user-briefs/${user.id}?limit=1`)
        const data = await response.json()
        
        if (data.success) {
          setBriefsCount(data.pagination?.total || 0)
        }
      } catch (error) {
        console.error("Error fetching briefs count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBriefsCount()
  }, [user])

  const handleGenerateBrief = () => {
    router.push('/dashboard/generate')
  }

  const quickActions = [
    {
      title: "Generate Strategy Brief",
      description: "Create a comprehensive business analysis",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-yellow-500 to-yellow-600",
      action: () => router.push('/generate')
    },
    {
      title: "Market Research",
      description: "Analyze your competitive landscape",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      action: () => router.push('/market-research')
    },
    {
      title: "Network Builder",
      description: "Find strategic business connections",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      action: () => router.push('/network')
    },
    {
      title: "Industry News",
      description: "Stay updated with latest trends",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      action: () => router.push('/news')
    }
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-orange-500/10 border border-yellow-500/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-white">
                Welcome to Your Command Center
              </h1>
            </div>
            <p className="text-gray-300 text-lg mb-6">
              Your AI-powered business intelligence platform is ready to help you dominate your market.
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <Link href="/dashboard/generate" passHref>
                <Button
                  className="relative flex items-center gap-4 px-10 py-5 text-lg font-bold rounded-full bg-black border-2 border-yellow-500 shadow-lg hover:border-yellow-400 hover:shadow-yellow-500/40 transition-all duration-300 group"
                  style={{
                    boxShadow: "0 0 40px 0 rgba(251,191,36,0.15), 0 2px 8px 0 rgba(0,0,0,0.15)"
                  }}
                >
                  <span className="absolute -inset-1 rounded-full bg-yellow-500/10 blur-2xl opacity-40 group-hover:opacity-60 pointer-events-none"></span>
                  <span className="relative flex items-center gap-2">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 ">
                      <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    </span>
                    <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent font-extrabold text-xl ">
                      Generate My Strategy Brief
                    </span>
                    <ArrowRight className="w-6 h-6 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Stats */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Your Analytics Overview
          </h2>
          <DashboardStats briefsCount={briefsCount} />
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            >
              <div 
                className="bg-gray-900/50 border border-gray-800 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer group rounded-2xl"
                onClick={action.action}
              >
                <div className={`w-full h-32 bg-gradient-to-r ${action.color} rounded-t-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  {action.icon}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-gray-400">Loading your analytics...</span>
        </motion.div>
      )}
    </DashboardLayout>
  )
}