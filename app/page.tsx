"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Stethoscope,
  Users,
  MapPin,
  CheckCircle,
  Zap,
  DollarSign,
  Search,
  Handshake,
  XCircle,
  TrendingUp
} from "lucide-react"

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Search,
      title: "We Find Them For You",
      description: "We scrape and verify local providers in complementary specialties. You just show up and connect.",
      color: "blue"
    },
    {
      icon: MapPin,
      title: "Hyper-Local Matches",
      description: "Providers within 5-10 miles of your practice. Same community, same patients, easy referrals.",
      color: "emerald"
    },
    {
      icon: Handshake,
      title: "Mutual-Fit Only",
      description: "A chiropractor needs PTs. A PT needs orthopedic surgeons. We match specialties that actually refer to each other.",
      color: "amber"
    }
  ]

  const partnerships = [
    { from: "Chiropractor", to: "Physical Therapist" },
    { from: "Dentist", to: "Orthodontist" },
    { from: "Primary Care", to: "Specialist" },
    { from: "Med Spa", to: "Dermatologist" },
    { from: "Mental Health", to: "Primary Care" },
    { from: "Orthopedic", to: "Pain Management" },
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
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sleft Signals</span>
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
                <DollarSign className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">Stop paying agencies $3k/month for garbage leads</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                Your Best Referrals Are
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Down The Street
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                We find local healthcare providers who can send you patients.
                No ads. No agencies. Just partnerships with your neighbors.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth?signup=true"
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-blue-500/25"
                >
                  See Who's Near You
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center gap-2 px-8 py-4 text-slate-400 hover:text-white font-medium transition-colors"
                >
                  How It Works
                </Link>
              </div>
            </motion.div>
          </div>

          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mb-32"
          >
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                The Problem With Healthcare Marketing
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    What Agencies Do
                  </h3>
                  <ul className="space-y-3 text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      Charge $2-5k/month for Facebook ads
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      Send you tire-kickers who ghost
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      Zero integration with your community
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      You're competing with every practice in your city
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    What Actually Works
                  </h3>
                  <ul className="space-y-3 text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Referrals from other providers
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Patients who already trust someone
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Local relationships that compound
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Zero ad spend required
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-700 text-center">
                <p className="text-xl text-white font-medium">
                  The orthopedic surgeon 2 miles away could send you 10 patients a month.
                  <span className="text-slate-400 block mt-1">Do you even know their name?</span>
                </p>
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
                We Do The Work For You
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                No networking events. No cold calls. We find the providers, you make the connection.
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

          {/* Partnership Examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Referrals That Make Sense
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                We match specialties that naturally refer to each other. Your patients become their patients, and vice versa.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {partnerships.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4"
                >
                  <div className="flex-1 text-right">
                    <span className="text-white font-medium">{p.from}</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-medium">{p.to}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <p className="text-center text-slate-500 mt-6">
              And dozens more specialty combinations
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                See Who's In Your Area
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
                Enter your practice details and we'll show you providers nearby who could become referral partners.
              </p>
              <Link
                href="/auth?signup=true"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-semibold text-lg rounded-xl hover:bg-slate-100 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                Free to join. No credit card required.
              </p>
            </div>
          </motion.div>

          {/* Bottom line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
              Stop paying agencies to burn your budget.
              <span className="block text-slate-400 mt-2">
                Start building relationships with the providers next door.
              </span>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Sleft Signals</span>
          </div>
          <span className="text-sm text-slate-500">Local referral intelligence for healthcare practices</span>
        </div>
      </footer>
    </div>
  )
}
