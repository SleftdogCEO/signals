"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Stethoscope } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth")
      return
    }

    if (user) {
      // Check if user has a snapshot to view
      const hasSnapshot = typeof window !== 'undefined' && localStorage.getItem("lastSnapshotResult")
      if (hasSnapshot) {
        router.replace("/dashboard/snapshot")
      } else {
        // No snapshot yet, send them to create one
        router.replace("/")
      }
    }
  }, [user, authLoading, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/40 via-cyan-400/30 to-teal-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/40 via-teal-400/30 to-emerald-300/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
