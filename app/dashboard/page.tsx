"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth")
      return
    }

    if (user) {
      checkProviderProfile()
    }
  }, [user, authLoading, router])

  const checkProviderProfile = async () => {
    if (!user) return

    try {
      const { data: provider, error } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (error) {
        // Table might not exist or no profile - go to network with demo data
        console.log("Provider check error (table may not exist):", error.message)
        router.replace("/dashboard/network")
      } else if (!provider) {
        // No provider profile - redirect to onboarding
        router.replace("/onboarding")
      } else {
        // Has profile - redirect to network
        router.replace("/dashboard/network")
      }
    } catch (error) {
      console.error("Error checking provider:", error)
      // Default to network on error (demo mode)
      router.replace("/dashboard/network")
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/40 via-fuchsia-400/30 to-pink-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/40 via-teal-400/30 to-emerald-300/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
