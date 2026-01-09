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
  Handshake
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
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const canceled = searchParams.get('canceled') === 'true'

  // Check if Stripe is configured (we'll show test mode badge if not)
  const isTestMode = true // Will be determined by API response

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
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Sleft Health</span>
          </Link>
          <Link
            href="/dashboard/network"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Network
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {canceled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl text-center"
          >
            <p className="text-amber-300">
              Checkout was canceled. No worries - you can subscribe whenever you're ready.
            </p>
          </motion.div>
        )}

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl mb-6 shadow-2xl shadow-blue-500/30"
          >
            <Users className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            We'll Introduce You to<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Your Perfect Partners</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            No cold outreach. No awkward emails. We personally reach out to local practices,
            explain the mutual benefits, and schedule meetings on your behalf.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-lg mx-auto mb-12"
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl blur-lg opacity-30" />

          <div className="relative bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            {/* Popular badge */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-center">
              <span className="text-sm font-bold text-white">WARM INTRODUCTIONS SERVICE</span>
              <span className="ml-2 px-2 py-0.5 bg-amber-500 text-amber-950 text-xs font-bold rounded">TEST MODE</span>
            </div>

            <div className="p-8">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-white">$250</span>
                  <span className="text-xl text-slate-400">/month</span>
                </div>
                <p className="text-slate-400 mt-2">Cancel anytime • Typically 3-5 intros/month</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">We reach out to partners on your behalf</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">Meetings scheduled for you</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">Pre-qualified, mutual-fit partners only</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">Relationship facilitation support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">Access to community &amp; insights</span>
                </li>
              </ul>

              {/* CTA */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Shield className="w-4 h-4" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
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
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 rounded-2xl p-8 border border-slate-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Common Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-white mb-2">How does the intro process work?</h3>
              <p className="text-slate-400">
                We identify local practices that would benefit from a partnership with you.
                We reach out on your behalf, explain the mutual value, and if they're interested,
                we schedule a meeting between you. No cold calling on your end.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">How many intros can I expect?</h3>
              <p className="text-slate-400">
                Most members receive 3-5 warm introductions per month, depending on your specialty
                and location. Quality over quantity — every intro is someone who wants to meet you.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-400">
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
