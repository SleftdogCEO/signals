"use client"

import { useState, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Stethoscope,
  Check,
  Users,
  Zap,
  Shield,
  ArrowLeft,
  Loader2,
  Crown,
  MessageSquare,
  Target,
  Handshake,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const FEATURES = [
  {
    icon: Handshake,
    title: "Partner Matching",
    description: "Connect with local healthcare providers who want to exchange referrals with you. Two-way matches only."
  },
  {
    icon: Target,
    title: "Community Intelligence",
    description: "Real insights from real practices. What software works, what doesn't, and how to grow your practice."
  },
  {
    icon: Users,
    title: "AI-Curated Insights",
    description: "Get personalized intelligence tailored to your specialty, location, and interests."
  },
  {
    icon: MessageSquare,
    title: "Reviews & Discussions",
    description: "See what other practices say about vendors, software, and growth strategies."
  }
]

function UpgradeContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const canceled = searchParams.get('canceled') === 'true'

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/auth?redirect=/dashboard/network/upgrade')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        })
      })

      const { url, error, testMode } = await response.json()

      if (error) {
        toast.error(error)
        setLoading(false)
        return
      }

      if (testMode) {
        toast.success('Test mode: Subscription activated!')
      }

      // Redirect to success page or Stripe Checkout
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white hidden sm:block">Sleft Signals</h1>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/network/hub"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Network</span>
              </Link>
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
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 py-12">
        {canceled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center"
          >
            <p className="text-amber-400">
              Checkout was canceled. No worries - you can subscribe whenever you're ready.
            </p>
          </motion.div>
        )}

        {/* Hero */}
        <div className="text-center py-10 lg:py-14">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30"
          >
            <Users className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 leading-[1.1]"
          >
            Become a
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Founding Member
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Be one of the first independent Tampa practices in the network. Founding members
            join free and lock in early pricing as it grows.
          </motion.p>
        </div>

        {/* Free Access Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-lg mx-auto mb-12"
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl blur-lg opacity-20" />

          <div className="relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Badge */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-center">
              <span className="text-sm font-bold text-white tracking-wide">FOUNDING MEMBER</span>
            </div>

            <div className="p-8">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-white">Free</span>
                </div>
                <p className="text-slate-400 mt-2">for founding members, no credit card</p>
                <p className="text-slate-500 text-sm mt-1">Early members lock in founding pricing as the network grows.</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  "Partner matching with local providers",
                  "Community insights and discussions",
                  "AI-curated intelligence for your specialty",
                  "Product reviews from real practices",
                  "Full access to all features"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/dashboard/network/hub"
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
              >
                <Zap className="w-5 h-5" />
                Become a Founding Member
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Shield className="w-4 h-4" />
                  Secure platform
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Check className="w-4 h-4" />
                  Founding member
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900 rounded-2xl p-8 border border-slate-800"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Common Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-white mb-2">How does partner matching work?</h3>
              <p className="text-slate-400 text-sm">
                We identify local practices that would be a good fit for referral partnerships with you.
                You can browse matches, see compatibility scores, and connect directly with providers who want to exchange referrals.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">What features are included?</h3>
              <p className="text-slate-400 text-sm">
                Partner matching, community discussions, AI-curated insights specific to your specialty,
                and product reviews from real practices. Free for founding members.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Is it really free, and what happens later?</h3>
              <p className="text-slate-400 text-sm">
                Yes. Founding members join free while we build the Tampa network, with no credit card required.
                As the network grows and starts sending you patients, there will be a membership, and founding
                members lock in the early rate.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
