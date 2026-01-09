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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, 40, 0],
            y: [0, 40, 80, 0],
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/40 via-fuchsia-400/30 to-pink-300/20 rounded-full blur-3xl"
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
      </div>

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Sleft Health</span>
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </motion.div>
      </nav>

      {/* Main */}
      <div className="relative z-10 min-h-[calc(100vh-100px)] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border border-teal-200 rounded-full shadow-sm">
              <Shield className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-teal-700 font-semibold">Join the healthcare referral network</span>
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
              <span className="text-gray-900">Get matched with </span>
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                referral partners
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Connect with healthcare providers who need your patients—and have patients for you.
            </p>
          </motion.div>

          {/* Value props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {[
              { icon: UserPlus, label: "Smart Matching", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
              { icon: Users, label: "500+ Providers", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
              { icon: Heart, label: "Warm Intros", color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
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
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <AuthCard />
          </motion.div>

          {/* Trust badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-gray-500 mt-6 font-medium"
          >
            14-day free trial. $450/month after.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
