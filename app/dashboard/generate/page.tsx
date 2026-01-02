"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, ArrowRight, Sparkles, ArrowLeft, Check, Edit3, Users, Calendar, Newspaper } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { OutreachStrategy, DiscoveryResponse } from "@/types/strategy"

interface Message {
  role: "user" | "assistant"
  content: string
}

type Phase = "discovery" | "confirmation" | "generating"

export default function GeneratePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Strategy state
  const [phase, setPhase] = useState<Phase>("discovery")
  const [strategy, setStrategy] = useState<OutreachStrategy | null>(null)
  const [isReadyForStrategy, setIsReadyForStrategy] = useState(false)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0 && user) {
      initConversation()
    }
  }, [user])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input
  useEffect(() => {
    if (phase === "discovery") {
      inputRef.current?.focus()
    }
  }, [phase, messages])

  const initConversation = async () => {
    try {
      const response = await fetch("/api/chat/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, reset: true }),
      })
      const data: DiscoveryResponse = await response.json()

      if (data.success && data.message) {
        setMessages([{ role: "assistant", content: data.message }])
      }
    } catch (error) {
      console.error("Failed to init conversation:", error)
      setMessages([{
        role: "assistant",
        content: "Hey! Sleft helps you find local businesses worth connecting with. What's your business?"
      }])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const userMessage = input.trim()
    setInput("")
    setIsSending(true)

    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }])

    try {
      const response = await fetch("/api/chat/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          message: userMessage
        }),
      })

      const data: DiscoveryResponse = await response.json()

      if (data.success) {
        // Add AI response
        setMessages(prev => [...prev, { role: "assistant", content: data.message }])

        // Check if ready for strategy confirmation
        if (data.isReadyForStrategy && data.proposedStrategy) {
          setStrategy(data.proposedStrategy)
          setIsReadyForStrategy(true)
        }
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Sorry, I missed that. Can you tell me more about your business?"
        }])
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection issue. What were you saying?"
      }])
    }

    setIsSending(false)
  }

  const handleConfirmStrategy = () => {
    setPhase("confirmation")
  }

  const handleEditStrategy = () => {
    setIsReadyForStrategy(false)
    setStrategy(null)
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "No problem. What would you like to change?"
    }])
  }

  const handleGenerate = async () => {
    if (!strategy || isGenerating) return

    setPhase("generating")
    setIsGenerating(true)

    try {
      // Build search params from strategy
      const searchParams = {
        businessName: strategy.business.name,
        industry: strategy.business.industry,
        location: strategy.business.location,
        customGoal: strategy.goal,
        targetLeads: strategy.targetLeads.map(l => l.type).join(", "),
        targetEvents: strategy.targetEvents.map(e => e.type).join(", "),
        userId: user?.id,
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      })

      const data = await response.json()
      console.log("Generate response:", data)

      if (data.briefId) {
        // Success - redirect to the brief
        router.push(`/dashboard/briefs/${data.briefId}`)
      } else if (data.error) {
        console.error("Generation error:", data.error)
        setPhase("confirmation")
        setIsGenerating(false)
      } else {
        console.error("Unexpected response:", data)
        setPhase("confirmation")
        setIsGenerating(false)
      }
    } catch (error) {
      console.error("Generation error:", error)
      setPhase("confirmation")
      setIsGenerating(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/50 via-pink-400/40 to-orange-300/30 rounded-full blur-3xl"
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
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 40, 0], y: [0, 40, 80, 0], scale: [1, 1.2, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/40 via-pink-400/30 to-orange-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -60, -30, 0], y: [0, 60, 30, 0], scale: [1, 1.15, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/40 via-teal-400/30 to-emerald-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0], scale: [1, 1.1, 1.2, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-violet-400/30 via-purple-400/20 to-indigo-300/10 rounded-full blur-3xl"
        />
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

            {/* Phase indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${phase === "discovery" ? "bg-violet-500" : "bg-gray-300"}`} />
              <div className={`w-2 h-2 rounded-full ${phase === "confirmation" ? "bg-violet-500" : "bg-gray-300"}`} />
              <div className={`w-2 h-2 rounded-full ${phase === "generating" ? "bg-violet-500" : "bg-gray-300"}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4">
        <AnimatePresence mode="wait">
          {/* PHASE 1: Discovery Chat */}
          {phase === "discovery" && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Messages */}
              <div className="flex-1 py-6 space-y-4 overflow-y-auto">
                <AnimatePresence>
                  {messages.map((msg, i) => {
                    // Check if this is a strategy summary message
                    const isStrategySummary = msg.role === "assistant" &&
                      (msg.content.includes("🎯 PARTNERS") || msg.content.includes("Here's what I'll search for"))

                    if (isStrategySummary && strategy) {
                      // Render as styled strategy card
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="w-full max-w-md space-y-3">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white px-4 py-3 rounded-2xl">
                              <p className="font-medium">Here's your search plan for {strategy.business.location}</p>
                            </div>

                            {/* Partners Card */}
                            {strategy.targetLeads.length > 0 && (
                              <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-gray-900">Partners</span>
                                </div>
                                <div className="space-y-2">
                                  {strategy.targetLeads.slice(0, 5).map((lead, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-800">{lead.type}</span>
                                        {lead.reason && (
                                          <span className="text-gray-500 text-sm"> — {lead.reason}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Events Card */}
                            {strategy.targetEvents.length > 0 && (
                              <div className="bg-white rounded-2xl border-2 border-orange-200 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-gray-900">Events</span>
                                </div>
                                <div className="space-y-2">
                                  {strategy.targetEvents.map((event, j) => (
                                    <div key={j} className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-orange-600" />
                                      </div>
                                      <span className="text-gray-700">{event.type}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Confirmation prompt */}
                            <div className="bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 px-4 py-3 rounded-2xl">
                              <p>Look good?</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    }

                    // Regular message rendering
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white"
                              : "bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {isSending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input or Strategy Confirmation Prompt */}
              <div className="py-4">
                {isReadyForStrategy && strategy ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <button
                      onClick={handleEditStrategy}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      Adjust
                    </button>
                    <button
                      onClick={handleConfirmStrategy}
                      className="flex-[2] flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-semibold rounded-2xl hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-lg shadow-fuchsia-500/25"
                    >
                      Find My Partners
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type here..."
                      className="flex-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm transition-all"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isSending}
                      className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white rounded-2xl hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-lg shadow-fuchsia-500/25 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {/* PHASE 2: Strategy Confirmation */}
          {phase === "confirmation" && strategy && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col py-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Here's your search plan
                </h1>
                <p className="text-gray-500">
                  We'll find these opportunities in {strategy.business.location}
                </p>
              </div>

              {/* Strategy Cards */}
              <div className="space-y-4 mb-8">
                {/* Partners */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Partners We'll Find</h3>
                      <p className="text-sm text-gray-500">Businesses worth connecting with</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {strategy.targetLeads.map((lead, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-800">{lead.type}</span>
                          {lead.reason && (
                            <span className="text-gray-500 text-sm"> — {lead.reason}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events */}
                {strategy.targetEvents.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Events We'll Surface</h3>
                        <p className="text-sm text-gray-500">Places to meet people</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {strategy.targetEvents.map((event, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-800">{event.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intel */}
                {strategy.targetIntel.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Intel We'll Gather</h3>
                        <p className="text-sm text-gray-500">Market context</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {strategy.targetIntel.map((intel, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-800">{intel.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setPhase("discovery")}
                  className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-semibold rounded-2xl hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-lg shadow-fuchsia-500/25"
                >
                  Find My Partners
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: Generating */}
          {phase === "generating" && strategy && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-8"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Finding partners for {strategy.business.name}
                </h2>
                <p className="text-gray-500">
                  Searching {strategy.business.location}...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
