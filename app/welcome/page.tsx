"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Stethoscope,
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Zap,
  Target,
  TrendingUp
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const WELCOME_SECTIONS = [
  {
    id: "intro",
    badge: "Welcome to Sleft Health",
    title: "We're Not Another Directory",
    subtitle: "Sure, you could find partners with ChatGPT. But who has time to chase down contact info, send cold emails, and hope someone responds?",
    description: "We do the heavy lifting. Real intros. Booked meetings. Partners who actually want to work with you.",
    icon: Target,
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    id: "intros",
    badge: "The Sleft Difference",
    title: "Real Intros, Not Cold Outreach",
    subtitle: "Every connection is warm. Every partner is vetted. Every intro is facilitated by us.",
    features: [
      "We reach out on your behalf",
      "We schedule the meeting",
      "We make sure it's a mutual fit"
    ],
    icon: Calendar,
    gradient: "from-emerald-500 to-teal-400"
  },
  {
    id: "intelligence",
    badge: "Community Intelligence",
    title: "Learn From Practices Like Yours",
    subtitle: "Stop guessing. See what's actually working for other practices in your area and specialty.",
    features: [
      "Software recommendations from real users",
      "Marketing strategies that work",
      "Operational insights you won't find elsewhere"
    ],
    icon: MessageSquare,
    gradient: "from-violet-500 to-purple-400"
  },
  {
    id: "ai",
    badge: "AI-Powered Growth",
    title: "Your Practice Growth Partner",
    subtitle: "Get personalized guidance on using AI to grow your practice — marketing, patient engagement, operations.",
    description: "Led by Grant Denmark, helping practices implement what actually works. Not theory. Results.",
    icon: Zap,
    gradient: "from-amber-500 to-orange-400"
  }
]

export default function WelcomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [currentSection, setCurrentSection] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth")
    } else if (user) {
      // Small delay for dramatic effect
      setTimeout(() => setIsReady(true), 500)
    }
  }, [user, authLoading, router])

  const handleNext = () => {
    if (currentSection < WELCOME_SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      // Final section - go to hub
      router.push("/dashboard/network/hub")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard/network/hub")
  }

  const section = WELCOME_SECTIONS[currentSection]
  const isLastSection = currentSection === WELCOME_SECTIONS.length - 1
  const Icon = section.icon

  if (authLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Stethoscope className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Preparing Your Experience</h2>
          <p className="text-slate-400">One moment...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Subtle background - much lower opacity */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
        {WELCOME_SECTIONS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSection
                ? "w-8 bg-white"
                : index < currentSection
                ? "bg-white/50"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="fixed top-8 right-8 z-50 text-slate-500 hover:text-white text-sm font-medium transition-colors"
      >
        Skip intro
      </button>

      {/* Logo */}
      <div className="fixed top-8 left-8 z-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">Sleft Health</span>
      </div>

      {/* Main content */}
      <div className="min-h-screen flex items-center justify-center px-6 py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30"
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm font-medium text-slate-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                {section.badge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1]"
            >
              {section.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              {section.subtitle}
            </motion.p>

            {/* Features list (if present) */}
            {section.features && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-4 mb-10"
              >
                {section.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Description (if present) */}
            {section.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-slate-500 mb-10 max-w-xl mx-auto"
              >
                {section.description}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={handleNext}
                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-xl rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-blue-500/25"
              >
                {isLastSection ? (
                  <>
                    Enter Your Network
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>

            {/* Section counter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-sm text-slate-600"
            >
              {currentSection + 1} of {WELCOME_SECTIONS.length}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard navigation hint */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-slate-600 text-sm">
        Press <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400 mx-1">Enter</kbd> or click to continue
      </div>
    </div>
  )
}
