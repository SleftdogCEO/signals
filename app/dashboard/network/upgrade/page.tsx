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
    title: "We Make The Introductions",
    description: "No cold outreach needed. We personally reach out to partners on your behalf, explain the mutual benefits, and schedule meetings."
  },
  {
    icon: Target,
    title: "Pre-Qualified Partners",
    description: "We vet every connection to ensure it's a good fit. Both practices benefit - no one-sided relationships."
  },
  {
    icon: Users,
    title: "Scheduled Meetings",
    description: "We don't just send names. We book actual meetings between you and partners who want to work with you."
  },
  {
    icon: MessageSquare,
    title: "Ongoing Relationship Support",
    description: "We help facilitate the first few referrals to make sure the partnership gets off to a strong start."
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
    <div className="min-h-screen bg-slate-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white hidden sm:block">Sleft Health</h1>
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
            We'll Introduce You to
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Perfect Partners
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto"
          >
            No cold outreach. No awkward emails. We personally reach out to local practices,
            explain the mutual benefits, and schedule meetings on your behalf.
          </motion.p>
        </div>

        {/* Pricing Card */}
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
              <span className="text-sm font-bold text-white tracking-wide">WARM INTRODUCTIONS SERVICE</span>
            </div>

            <div className="p-8">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-white">$120</span>
                  <span className="text-xl text-slate-400">/month</span>
                </div>
                <p className="text-slate-500 mt-2">Cancel anytime • Typically 3-5 intros/month</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  "We reach out to partners on your behalf",
                  "Meetings scheduled for you",
                  "Pre-qualified, mutual-fit partners only",
                  "Relationship facilitation support",
                  "Access to community & insights"
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
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to Checkout...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Subscribe Now
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Shield className="w-4 h-4" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Check className="w-4 h-4" />
                  Cancel anytime
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
              <h3 className="font-bold text-white mb-2">How does the intro process work?</h3>
              <p className="text-slate-400 text-sm">
                We identify local practices that would benefit from a partnership with you.
                We reach out on your behalf, explain the mutual value, and if they're interested,
                we schedule a meeting between you. No cold calling on your end.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">How many intros can I expect?</h3>
              <p className="text-slate-400 text-sm">
                Most members receive 3-5 warm introductions per month, depending on your specialty
                and location. Quality over quantity — every intro is someone who wants to meet you.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-400 text-sm">
                Yes! Cancel anytime from your account settings. You'll keep access until
                the end of your billing period.
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
