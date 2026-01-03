"use client"

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { ArrowRight, Sparkles, Users, UserPlus, Shield, CheckCircle, Stethoscope, Heart, Brain, Bone } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

// Typewriter effect for specialties
function TypewriterText() {
  const words = ["Physical Therapists", "Chiropractors", "Dentists", "Surgeons", "Counselors", "Specialists"]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[currentIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 1500)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentIndex, words])

  return (
    <span className="inline-block min-w-[200px] md:min-w-[320px]">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// Animated counter
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <span>{count.toLocaleString()}{suffix}</span>
}

// Floating card with mouse tracking
function FloatingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [5, -5])
  const rotateY = useTransform(x, [-100, 100], [-5, 5])

  const springConfig = { stiffness: 150, damping: 15 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      style={{ rotateX: rotateXSpring, rotateY: rotateYSpring, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/auth"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl text-sm font-medium text-white transition-all shadow-lg hover:shadow-xl"
          >
            Join the Network
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 px-6 lg:px-12 pt-12 lg:pt-16 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border border-teal-200 rounded-full shadow-sm">
              <Shield className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-teal-700 font-semibold">The referral network for healthcare providers</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-center leading-tight mb-6"
          >
            <span className="text-gray-900">Stop cold-calling.</span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              Connect with <TypewriterText />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-700 text-center max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Join a network of healthcare providers <span className="font-semibold text-gray-900">actively exchanging patient referrals</span>.
            Get matched with complementary practices in your area. We facilitate the introductions.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4 mb-16"
          >
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-semibold text-lg px-10 py-5 rounded-2xl overflow-hidden shadow-2xl shadow-fuchsia-500/30"
              >
                <span className="relative z-10">Join the Network</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
            <p className="text-sm text-gray-500 font-medium">$450/month - 14-day free trial</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 lg:gap-16 mb-20"
          >
            {[
              { value: 500, suffix: "+", label: "Providers in network", color: "text-violet-600", bg: "bg-violet-50" },
              { value: 35, suffix: "+", label: "Specialties represented", color: "text-emerald-600", bg: "bg-emerald-50" },
              { value: 5, suffix: "", label: "Intros guaranteed/mo", color: "text-rose-600", bg: "bg-rose-50" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`text-4xl lg:text-5xl font-bold ${stat.color}`}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className={`text-sm font-medium text-gray-600 mt-2 px-3 py-1 ${stat.bg} rounded-full inline-block`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">Three steps to your referral network</p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-24">
            <FloatingCard delay={0.6}>
              <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-violet-200 rounded-2xl h-full hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/20 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-bold text-violet-600 mb-2">Step 1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Profile</h3>
                <p className="text-gray-600">
                  Tell us your specialty, location, and what types of patients you want to receive and refer.
                </p>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.7}>
              <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl h-full hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-bold text-emerald-600 mb-2">Step 2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Matched</h3>
                <p className="text-gray-600">
                  We match you with complementary providers. PTs meet orthopedic surgeons. Dentists meet periodontists.
                </p>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.8}>
              <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-rose-200 rounded-2xl h-full hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/20 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-bold text-rose-600 mb-2">Step 3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Build Relationships</h3>
                <p className="text-gray-600">
                  Accept intros from providers who want to connect. Exchange referrals. Grow together.
                </p>
              </div>
            </FloatingCard>
          </div>

          {/* The Problem / Solution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="max-w-4xl mx-auto mb-24"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                The Old Way vs. The Network Way
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Old way */}
              <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-700 mb-4">The Old Way</h3>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    Cold-calling other practices
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    Dropping off business cards and hoping
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    Attending random networking events
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    No way to know who wants referrals
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    One-sided relationships
                  </li>
                </ul>
              </div>

              {/* Network way */}
              <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-300 rounded-2xl relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-full">BETTER</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">The Sleft Health Network</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Everyone in the network wants referral partners
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Smart matching based on patient overlap
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    We facilitate warm introductions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Two-way relationships (give and receive)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    5 guaranteed intros every month
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="max-w-lg mx-auto mb-24"
          >
            <div className="p-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl text-white text-center shadow-2xl shadow-violet-500/30">
              <h3 className="text-2xl font-bold mb-2">Sleft Health Network</h3>
              <p className="text-violet-200 mb-6">For healthcare providers serious about growth</p>

              <div className="mb-6">
                <span className="text-5xl font-bold">$450</span>
                <span className="text-violet-200">/month</span>
              </div>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <span>Full network access (500+ providers)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <span>Smart matching algorithm</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <span>5 guaranteed intros per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <span>Direct contact info on connection</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </li>
              </ul>

              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-white text-violet-600 font-bold text-lg rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Start 14-Day Free Trial
                </motion.button>
              </Link>

              <p className="text-sm text-violet-200 mt-4">
                One new patient covers your monthly cost
              </p>
            </div>
          </motion.div>

          {/* Specialties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 font-medium mb-6">Providers from 35+ specialties</p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              {[
                { name: "Physical Therapy", icon: Bone },
                { name: "Orthopedics", icon: Bone },
                { name: "Chiropractic", icon: Bone },
                { name: "Mental Health", icon: Brain },
                { name: "Primary Care", icon: Stethoscope },
                { name: "Dentistry", icon: Heart },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full shadow-sm"
                >
                  <item.icon className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">Sleft Health Network - The referral network for healthcare</span>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm text-gray-600 hover:text-violet-600 transition-colors font-semibold">
              Join the Network
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
