"use client"

import { AuthCard } from "@/components/auth/AuthCard"
import { motion } from "framer-motion"
import { Sparkles, ArrowLeft, Shield, Users, UserPlus, Heart, LogOut, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  // Show logged in state
  if (!loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">You're logged in</h1>
          <p className="text-slate-400 mb-8">as {user.email}</p>

          <div className="space-y-3">
            <Link
              href="/dashboard/network/hub"
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out & Switch Account
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Sleft Signals</span>
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-white bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </motion.div>
      </nav>

      {/* Main */}
      <div className="relative z-10 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-semibold">Founding members join free</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-white">Get matched with </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                referral partners
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md mx-auto">
              Sign up free and instantly see the independent practices near you who could be sending you patients.
            </p>
          </motion.div>

          {/* Two column layout: Video + Auth */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* VSL Video */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="order-2 lg:order-1 flex justify-center"
            >
              <div className="w-full max-w-[280px]">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-800 bg-black">
                  <video
                    controls
                    playsInline
                    className="w-full aspect-[9/16]"
                  >
                    <source src="/videos/vsl.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <p className="text-center text-sm text-slate-500 mt-3">
                  Watch: How Sleft Signals helps you grow your practice
                </p>
              </div>
            </motion.div>

            {/* Right side: Auth */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="order-1 lg:order-2"
            >
              {/* Value props */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {[
                  { icon: UserPlus, label: "Smart Matching", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                  { icon: Users, label: "500+ Providers", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
                  { icon: Heart, label: "Two-Way Matches", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`flex items-center gap-2 px-4 py-2 ${item.bg} border rounded-full`}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Auth Card */}
              <AuthCard />

              {/* Trust badge */}
              <p className="text-center text-sm text-slate-500 mt-6 font-medium">
                Free for founding members. See your referral partners the moment you join.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
