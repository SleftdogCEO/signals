"use client"
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Zap, TrendingUp, Newspaper, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

// Typewriter effect for rotating words
function TypewriterText() {
  const words = ["Winning", "Growing", "Connecting", "Closing", "Scaling", "Thriving"]
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
          // Pause at full word
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
    <span className="inline-block min-w-[200px] md:min-w-[280px]">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// Animated counter component
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

// Floating card component with mouse tracking
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
      {/* Vibrant background with colorful gradient blobs */}
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/auth"
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl text-sm font-medium text-white transition-all shadow-lg hover:shadow-xl"
          >
            Sign In
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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 border border-orange-200 rounded-full shadow-sm">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700 font-semibold">Your unfair advantage starts here</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-center leading-tight mb-6"
          >
            <span className="text-gray-900">Stop guessing.</span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              Start <TypewriterText />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-700 text-center max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Find <span className="font-semibold text-gray-900">referral partners</span> in your area who can send you customers.
            We scan your local market in <span className="font-semibold text-gray-900">60 seconds</span> and hand you personalized openers to reach out.
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
                <span className="relative z-10">Try It Free</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
            <p className="text-sm text-gray-500 font-medium">Get your first brief free. No credit card required.</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 lg:gap-16 mb-20"
          >
            {[
              { value: 10, suffix: "+", label: "Partners per scan", color: "text-emerald-600", bg: "bg-emerald-50" },
              { value: 60, suffix: "s", label: "Average scan time", color: "text-violet-600", bg: "bg-violet-50" },
              { value: 12, suffix: "+", label: "Events discovered", color: "text-rose-600", bg: "bg-rose-50" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`text-4xl lg:text-5xl font-bold ${stat.color}`}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className={`text-sm font-medium text-gray-600 mt-2 px-3 py-1 ${stat.bg} rounded-full inline-block`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FloatingCard delay={0.6}>
              <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl h-full hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Referral Partners</h3>
                <p className="text-gray-600">
                  Businesses that serve your ideal customers. Complete with contact info and openers.
                </p>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.7}>
              <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl h-full hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                  <Newspaper className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready-to-Send Openers</h3>
                <p className="text-gray-600">
                  Personalized messages for each partner. Just copy, paste, and send.
                </p>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.8}>
              <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-2xl h-full hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Local Events</h3>
                <p className="text-gray-600">
                  Networking opportunities in your area. Show up where deals happen.
                </p>
              </div>
            </FloatingCard>
          </div>

          {/* Google comparison section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-24 max-w-4xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                &ldquo;Can&apos;t I just use Google?&rdquo;
              </h2>
              <p className="text-gray-600">Here&apos;s the difference.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Google column */}
              <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-700">Google Search</h3>
                </div>
                <p className="text-gray-600 mb-4">Answers: <span className="font-semibold">&ldquo;What businesses exist?&rdquo;</span></p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    Shows you a list of businesses
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    Names, addresses, reviews
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    No context on partnership fit
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    You figure out what to say
                  </li>
                </ul>
              </div>

              {/* Sleft column */}
              <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-300 rounded-2xl relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-full">BETTER</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Sleft</h3>
                </div>
                <p className="text-gray-700 mb-4">Answers: <span className="font-semibold">&ldquo;Who should I partner with &amp; how do I reach them?&rdquo;</span></p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Finds partners whose customers overlap with yours
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Decision maker contact info included
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Personalized outreach messages ready to send
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Local events where partners hang out
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-center text-gray-500 mt-6 text-sm">
              It&apos;s the difference between a phone book and a sales team doing research for you.
            </p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-20 text-center"
          >
            <p className="text-sm text-gray-500 font-medium mb-6">Trusted by ambitious businesses</p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              {["Agency owners", "Consultants", "Local businesses", "Freelancers", "Sales teams"].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">Sleft Signals - Your unfair advantage</span>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm text-gray-600 hover:text-violet-600 transition-colors font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
