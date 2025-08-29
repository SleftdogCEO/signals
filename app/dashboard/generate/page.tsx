"use client"

import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Brain,
  Target,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LLMOnboardingChat } from "@/components/chat/LLMOnboardingChat"

interface OnboardingData {
  business_name: string
  website_url: string
  industry: string
  location: string
  partnership_goals: string
  growth_objectives: string
  custom_goal: string
  networking_keyword: string
}

export default function GeneratePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  const handleOnboardingComplete = async (data: OnboardingData) => {
    console.log("Onboarding complete:", data)
    setCurrentStep(2)
    setError("")

    try {
      if (!user?.id) {
        throw new Error("Please log in again")
      }

      const formData = {
        businessName: data.business_name,
        websiteUrl: data.website_url === 'none' ? '' : data.website_url,
        industry: data.industry,
        location: data.location,
        customGoal: data.custom_goal || `${data.growth_objectives || ''} ${data.partnership_goals || ''}`.trim(),
        networkingKeyword: data.networking_keyword || data.industry,
        partnershipGoals: data.partnership_goals,
        conversationData: data,
        userId: user.id
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Server error ${response.status}`)
      }

      if (!result.briefId) {
        throw new Error("Brief generation failed")
      }

      setCurrentStep(3)
      
      setTimeout(() => {
        router.push(`/dashboard/briefs/${result.briefId}`)
      }, 2000)
      
    } catch (error) {
      console.error("Brief generation error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setCurrentStep(1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile-Optimized Navigation */}
      <nav className="border-b border-gray-800 bg-black">
        <div className="mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
            </div>
            <span className="text-base sm:text-xl font-bold text-white">Sleft Signals</span>
          </Link>

          {/* Mobile-Optimized Progress Steps */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400"
            }`}>
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400"
            }`}>
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400"
            }`}>
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Mobile-Optimized Hero */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent px-2">
                  Let's Build Your Strategy Brief
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                  Tell me about your business and I'll create a personalized strategy brief with competitive insights.
                </p>
              </div>

              {/* Mobile-Optimized Error Display */}
              {error && (
                <div className="mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/50 border border-red-500/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-200 text-xs sm:text-sm flex-1">{error}</span>
                  <Button
                    onClick={() => setError("")}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-300 hover:bg-red-500/10 text-xs"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Mobile-Optimized Chat Interface */}
              <div className="w-full h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] md:h-[70vh] max-w-5xl mx-auto">
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl h-full overflow-hidden">
                  {user && (
                    <LLMOnboardingChat
                      onComplete={handleOnboardingComplete}
                      userId={user.id}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-2xl mx-auto px-4"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Creating Your Strategy Brief</h2>
              <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8">
                Analyzing your business, competitors, and market opportunities...
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-spin" />
                  <span className="text-sm sm:text-base">Processing business data...</span>
                </div>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-spin" />
                  <span className="text-sm sm:text-base">Finding competitors...</span>
                </div>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-spin" />
                  <span className="text-sm sm:text-base">Generating recommendations...</span>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-2xl mx-auto px-4"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Brief Ready!</h2>
              <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8">
                Your strategy brief is complete. Redirecting you now...
              </p>
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-spin mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
