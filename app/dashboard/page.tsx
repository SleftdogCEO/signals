"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, FileText, Loader2, Sparkles, Zap, Building2, MapPin, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

interface Brief {
  id: string
  businessName: string
  createdAt: string
  metadata?: {
    industry?: string
    location?: string
  }
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchBriefs = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/user-briefs/${user.id}?limit=10`)
        const data = await response.json()

        if (data.success && data.briefs) {
          setBriefs(data.briefs)
        }
      } catch (error) {
        console.error("Error fetching briefs:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBriefs()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* Vibrant background */}
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
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
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
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/40 via-pink-400/30 to-orange-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, -30, 0],
            y: [0, 60, 30, 0],
            scale: [1, 1.15, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/40 via-teal-400/30 to-emerald-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 1.2, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-violet-400/30 via-purple-400/20 to-indigo-300/10 rounded-full blur-3xl"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-amber-200/15 via-transparent to-sky-200/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Sleft</span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/generate")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white text-sm font-medium rounded-xl hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-lg shadow-fuchsia-500/25"
            >
              <Zap className="w-4 h-4" />
              Find Partners
            </motion.button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {briefs.length === 0 ? (
          // Empty state - direct to generate
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/30">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">Find partners who </span>
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">send you customers</span>
            </h1>
            <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
              Tell us about your business and we&apos;ll find the local connections worth making.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">Referral Partners</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700 font-medium">Networking Events</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Local Intel</span>
              </div>
            </div>

            <Link href="/dashboard/generate">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-semibold text-lg px-10 py-5 rounded-2xl overflow-hidden shadow-2xl shadow-fuchsia-500/30"
              >
                <span className="relative z-10">Find My Partners</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          // Briefs list
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Connections</h1>
                <p className="text-gray-500">View your partnership opportunities</p>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 rounded-full text-sm font-medium border border-violet-200">
                {briefs.length} total
              </span>
            </div>

            <div className="grid gap-4">
              {briefs.map((brief, i) => (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/dashboard/briefs/${brief.id}`}>
                    <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-xl flex items-center justify-center group-hover:from-violet-200 group-hover:to-fuchsia-200 transition-colors">
                          <FileText className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-violet-700 transition-colors">
                            {brief.businessName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            {brief.metadata?.industry && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {brief.metadata.industry}
                              </span>
                            )}
                            {brief.metadata?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {brief.metadata.location}
                              </span>
                            )}
                            {!brief.metadata?.industry && !brief.metadata?.location && (
                              <span>{new Date(brief.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 hidden sm:block">
                          {new Date(brief.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-violet-100 transition-colors">
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
