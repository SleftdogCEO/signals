"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Stethoscope,
  Users,
  Lightbulb,
  Star,
  CheckCircle,
  Zap,
  Building2,
  MessageSquare,
  Lock,
  TrendingUp
} from "lucide-react"

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Users,
      title: "Partner Matches",
      description: "Connect with local providers who actually want to exchange referrals with you. Two-way matches only.",
      color: "blue"
    },
    {
      icon: MessageSquare,
      title: "Community Intelligence",
      description: "Real insights from real practices. What software works, what doesn't, how to grow.",
      color: "emerald"
    },
    {
      icon: Lightbulb,
      title: "Curated Insights",
      description: "AI-powered intelligence tailored to your specialty, location, and interests.",
      color: "amber"
    }
  ]

  const practiceTypes = [
    "Private Practices",
    "Med Spas",
    "Chiropractic",
    "Physical Therapy",
    "Dental",
    "Mental Health",
    "Primary Care",
    "Specialty Clinics"
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sleft Health</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/auth"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth?signup=true"
            className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-20 px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">The network for healthcare growth</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                Grow Your Practice With
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  People Who Get It
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Partner connections that make sense. Intelligence that actually helps.
                Everything you need to grow — without outsourcing your entire operation.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth?signup=true"
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-blue-500/25"
                >
                  Find Your Partners
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center gap-2 px-8 py-4 text-slate-400 hover:text-white font-medium transition-colors"
                >
                  See How It Works
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mb-32"
          >
            <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
              {/* Lock overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent rounded-2xl flex items-end justify-center pb-12 z-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <Lock className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Your Partner Matches Are Waiting</h3>
                  <p className="text-slate-400 mb-6 max-w-md">
                    Sign up to see providers in your area who want to exchange referrals with you.
                  </p>
                  <Link
                    href="/auth?signup=true"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Unlock Your Matches
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Blurred preview content */}
              <div className="blur-sm pointer-events-none select-none">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Partner Matches in Austin, TX</h3>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                    12 matches
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="h-5 w-40 bg-slate-700 rounded mb-2" />
                          <div className="h-4 w-24 bg-slate-700/50 rounded" />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                          <span className="font-bold text-white">92</span>
                        </div>
                      </div>
                      <div className="h-16 bg-slate-700/30 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <div id="how-it-works" className="mb-32 scroll-mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything Your Practice Needs
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Real connections, real intelligence, real growth — from people who understand healthcare.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className={`relative bg-slate-900/50 border rounded-2xl p-8 transition-all duration-300 ${
                      hoveredFeature === index
                        ? 'border-blue-500/50 bg-slate-900/80'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                      feature.color === 'blue' ? 'bg-blue-500/10' :
                      feature.color === 'emerald' ? 'bg-emerald-500/10' :
                      'bg-amber-500/10'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        feature.color === 'blue' ? 'text-blue-400' :
                        feature.color === 'emerald' ? 'text-emerald-400' :
                        'text-amber-400'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* What You Get */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    What You Get Access To
                  </h2>
                  <ul className="space-y-4">
                    {[
                      "Partner matches with providers who want YOUR referrals",
                      "Community insights on software, marketing, and operations",
                      "AI-curated intelligence specific to your specialty",
                      "Reviews from real practices on what actually works",
                      "Direct introductions to potential partners"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-lg text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-slate-900/80 border border-slate-700 rounded-2xl p-8">
                    <div className="text-6xl font-black text-white mb-2">Free</div>
                    <div className="text-slate-400 mb-6">to get started</div>
                    <Link
                      href="/auth?signup=true"
                      className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Create Your Profile
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="text-sm text-slate-500 mt-4">
                      See your matches instantly. Upgrade anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Practice Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-32"
          >
            <p className="text-slate-500 font-medium mb-6">Built for all types of healthcare practices</p>
            <div className="flex flex-wrap justify-center gap-3">
              {practiceTypes.map((type, i) => (
                <div
                  key={i}
                  className="px-5 py-2.5 bg-slate-900/50 border border-slate-800 rounded-full text-slate-400"
                >
                  {type}
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Grow Your Practice?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
              Join the network of healthcare providers who are growing smarter together.
            </p>
            <Link
              href="/auth?signup=true"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-semibold text-lg rounded-xl hover:bg-slate-100 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Sleft Health</span>
          </div>
          <span className="text-sm text-slate-500">The network for healthcare growth</span>
        </div>
      </footer>
    </div>
  )
}
