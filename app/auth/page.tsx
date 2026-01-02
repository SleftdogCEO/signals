"use client"

import { AuthCard } from "@/components/auth/AuthCard"
import { motion } from "framer-motion"
import { Sparkles, ArrowLeft, Zap, TrendingUp, Newspaper, Calendar } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Vibrant background with colorful gradient blobs - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left - vibrant coral/pink */}
        <motion.div
          animate={{
            x: [0, 80, 40, 0],
            y: [0, 40, 80, 0],
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/50 via-pink-400/40 to-orange-300/30 rounded-full blur-3xl"
        />
        {/* Top right - vibrant teal/cyan */}
        <motion.div
          animate={{
            x: [0, -60, -30, 0],
            y: [0, 60, 30, 0],
            scale: [1, 1.15, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-10 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/50 via-teal-400/40 to-emerald-300/30 rounded-full blur-3xl"
        />
        {/* Bottom - vibrant purple/blue */}
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-violet-400/40 via-purple-400/30 to-indigo-300/20 rounded-full blur-3xl"
        />
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-amber-200/20 via-transparent to-sky-200/20 rounded-full blur-3xl" />
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
            <span className="text-xl font-bold text-gray-900">Sleft</span>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 border border-orange-200 rounded-full shadow-sm">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700 font-semibold">Find partners who send you customers</span>
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
              <span className="text-gray-900">One good partner </span>
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                beats 100 leads
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We help you find businesses that already have your customers.
            </p>
          </motion.div>

          {/* Value props - mini cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {[
              { icon: TrendingUp, label: "Referral Partners", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
              { icon: Calendar, label: "Networking Events", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
              { icon: Newspaper, label: "Local Intel", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
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
            Free forever. No credit card required.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
