"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, ArrowRight, Sparkles, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUESTIONS = [
  { key: "business_name", prompt: "First things first - what's your business called?" },
  { key: "industry", prompt: "Nice! What industry are you crushing it in?" },
  { key: "location", prompt: "Where's your home base? (City, State)" },
  { key: "custom_goal", prompt: "Last one - what's your #1 goal this quarter?" },
]

export default function GeneratePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [businessData, setBusinessData] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && user) {
      setMessages([{ role: "assistant", content: QUESTIONS[0].prompt }])
    }
  }, [user, messages.length])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentStep])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const userMessage = input.trim()
    setInput("")
    setIsSending(true)

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }])

    // Store the answer
    const currentQuestion = QUESTIONS[currentStep]
    const newData = { ...businessData, [currentQuestion.key]: userMessage }
    setBusinessData(newData)

    // Short delay for natural feel
    await new Promise(r => setTimeout(r, 400))

    // Next question or ready to generate
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1)
      setMessages(prev => [...prev, { role: "assistant", content: QUESTIONS[currentStep + 1].prompt }])
    } else {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Perfect! I'm about to scan ${newData.location} for leads, news, and events tailored to ${newData.business_name}. This takes about 60 seconds.`
      }])
    }

    setIsSending(false)
  }

  const handleGenerate = async () => {
    if (isGenerating) return
    setIsGenerating(true)

    setMessages(prev => [...prev, { role: "assistant", content: "Scanning your local market... This is where the magic happens." }])

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessData.business_name,
          industry: businessData.industry,
          location: businessData.location,
          customGoal: businessData.custom_goal,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (data.success && data.briefId) {
        router.push(`/dashboard/briefs/${data.briefId}`)
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Something went wrong. Please try again."
        }])
        setIsGenerating(false)
      }
    } catch (error) {
      console.error("Generation error:", error)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again."
      }])
      setIsGenerating(false)
    }
  }

  const isComplete = currentStep >= QUESTIONS.length - 1 && Object.keys(businessData).length >= 4
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/50 via-pink-400/40 to-orange-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/50 via-teal-400/40 to-emerald-300/30 rounded-full blur-3xl"
          />
        </div>
        <div className="relative flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Vibrant background with colorful gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, 40, 0],
            y: [0, 40, 80, 0],
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/40 via-pink-400/30 to-orange-300/20 rounded-full blur-3xl"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-amber-200/15 via-transparent to-sky-200/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <button className="p-2 bg-white hover:bg-gray-50 rounded-xl transition-colors shadow-sm border border-gray-200">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">Sleft</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-sm text-gray-500 font-medium">{currentStep + 1}/{QUESTIONS.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4">
        <div className="flex-1 py-8 space-y-4 overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3.5 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white"
                      : "bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="py-6">
          {isComplete && !isGenerating ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-semibold py-5 rounded-2xl hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-2xl shadow-fuchsia-500/30"
            >
              See My Opportunities
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : isGenerating ? (
            <div className="flex items-center justify-center gap-3 py-5 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
              </div>
              <span className="text-gray-600 font-medium">Finding opportunities...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm transition-all"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white rounded-2xl hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
