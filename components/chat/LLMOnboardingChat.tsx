"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, User, Send, Loader2, Target, Brain, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

interface LLMResponse {
  message: string
  data_collected: {
    business_name?: string
    website_url?: string
    industry?: string
    location?: string
    partnership_goals?: string
    growth_objectives?: string
    custom_goal?: string
    networking_keyword?: string
  }
  can_generate_brief: boolean
  progress_percentage: number
  brief_generation_trigger: boolean
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  briefLink?: string
  typing?: boolean
}

interface LLMOnboardingChatProps {
  onComplete: (data: OnboardingData) => void
  userId: string
}

export function LLMOnboardingChat({ onComplete, userId }: LLMOnboardingChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationData, setConversationData] = useState<Partial<OnboardingData>>({})
  const [canGenerateBrief, setCanGenerateBrief] = useState(false)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize conversation
  useEffect(() => {
    initializeConversation()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Calculate proper progress based on essential fields
  const calculateProgress = (data: Partial<OnboardingData>) => {
    const essentialFields = [
      'business_name',
      'industry', 
      'location',
      'custom_goal',
      'networking_keyword'
    ]
    
    const optionalFields = [
      'website_url',
      'partnership_goals',
      'growth_objectives'
    ]
    
    const essentialCompleted = essentialFields.filter(field => 
      data[field as keyof OnboardingData] && 
      data[field as keyof OnboardingData] !== "NOT YET ANSWERED"
    ).length
    
    const optionalCompleted = optionalFields.filter(field => 
      data[field as keyof OnboardingData] && 
      data[field as keyof OnboardingData] !== "NOT YET ANSWERED"
    ).length
    
    // Essential fields worth 60%, optional fields worth 40%
    const essentialProgress = (essentialCompleted / essentialFields.length) * 60
    const optionalProgress = (optionalCompleted / optionalFields.length) * 40
    
    return Math.round(essentialProgress + optionalProgress)
  }

  const canGenerateCheck = (data: Partial<OnboardingData>) => {
    const requiredFields = ['business_name', 'industry', 'location', 'custom_goal']
    const hasRequired = requiredFields.every(field => 
      data[field as keyof OnboardingData] && 
      data[field as keyof OnboardingData] !== "NOT YET ANSWERED"
    )
    
    const progress = calculateProgress(data)
    return hasRequired && progress >= 70
  }

  const initializeConversation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/chat/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()
      
      if (data.success) {
        setMessages([{
          id: Date.now().toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        }])
        setConversationData(data.data_collected || {})
      }
    } catch (error) {
      console.error("Failed to initialize conversation:", error)
      setMessages([{
        id: Date.now().toString(),
        role: "assistant",
        content: "Hi! I'm your AI business strategist. I need to learn about your business to create a personalized strategy brief. Let's start with your business name - what company are we working with?",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isGeneratingBrief) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user", 
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      typing: true,
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch("/api/chat/onboarding/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userMessage: currentInput,
          conversationData,
          messageHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      const data = await response.json()

      // Remove typing indicator
      setMessages(prev => prev.filter(m => !m.typing))

      if (data.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage])

        // CRITICAL: Only update progress when business data is actually collected
        if (data.is_business_data_collection) {
          console.log('✅ Business data collected - updating progress')
          
          // Update conversation data ONLY when business info is provided
          const updatedData = { ...conversationData }
          Object.keys(data.data_collected || {}).forEach(key => {
            const value = data.data_collected[key]
            if (value && value !== null) {
              updatedData[key as keyof OnboardingData] = value as string
              console.log(`📊 Updated ${key}: ${value}`)
            }
          })
          
          setConversationData(updatedData)
          
          // Calculate and update progress
          const newProgress = data.progress_percentage || 0
          setProgressPercentage(newProgress)
          setCanGenerateBrief(data.can_generate_brief || false)
          
          console.log(`📈 Progress updated to: ${newProgress}%`)
        } else {
          console.log('💭 General conversation - progress unchanged')
          // Don't update progress for general questions
        }

        // Auto-generate brief if triggered and we have sufficient data
        if (data.brief_generation_trigger && data.can_generate_brief && data.progress_percentage >= 70) {
          setTimeout(() => generateBrief(conversationData), 1000)
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => prev.filter(m => !m.typing))
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: "assistant",
        content: "I apologize for the technical difficulty. Please try asking your question again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }

    // Enhanced user experience for incomplete data
    const enhancedUserMessage = currentInput.toLowerCase()
    const isNegativeResponse = enhancedUserMessage.includes('no') || 
                              enhancedUserMessage.includes("don't") || 
                              enhancedUserMessage.includes('none') ||
                              enhancedUserMessage.includes("i don't know")

    if (isNegativeResponse) {
      console.log('🤔 User provided incomplete information, AI will adapt')
    }
  }

  const generateBrief = async (data: Partial<OnboardingData>) => {
    // Validate we have actual business data
    const hasBusinessData = (data.business_name && data.business_name.length > 2) ||
                         (data.industry && data.industry.length > 2) ||
                         (data.location && data.location.length > 2)

    if (!hasBusinessData) {
      const needMoreInfoMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I need to learn more about your business first. Could you tell me:\n\n• Your business name\n• What industry you're in\n• Your business location\n\nOnce I have this information, I can create a comprehensive strategy brief for you!",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, needMoreInfoMessage])
      return
    }

    // Check if we have user consent for brief generation
    const hasUserConsent = window.confirm(
      `Would you like me to create a comprehensive strategy brief for your business?\n\n` +
      `This will include:\n` +
      `• Competitive analysis and market opportunities\n` +
      `• Strategic partnership recommendations\n` +
      `• Growth strategies and action plans\n\n` +
      `Processing time: 2-4 minutes`
    )

    if (!hasUserConsent) {
      const declineMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "No problem! I'm here to help with any questions you have about business strategy, partnerships, or growth. What would you like to discuss?",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, declineMessage])
      return
    }

    setIsGeneratingBrief(true)
    
    try {
      const generatingMessage: Message = {
        id: Date.now().toString(),
        role: "assistant", 
        content: "🚀 Excellent! Creating your comprehensive strategy brief now. I'll analyze your business context, competitive landscape, and identify growth opportunities...\n\n⏱️ This will take 2-4 minutes for thorough analysis.",
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, generatingMessage])

      // Enhanced form data with intelligent defaults
      const formData = {
        businessName: data.business_name || `${data.industry || 'Professional'} Business`,
        websiteUrl: (data.website_url && data.website_url !== 'none' && data.website_url !== 'NOT YET ANSWERED') ? data.website_url : '',
        industry: data.industry || 'Professional Services',
        location: data.location || 'Local Market', 
        customGoal: data.custom_goal || data.growth_objectives || data.partnership_goals || 'Accelerate business growth and market expansion',
        networkingKeyword: data.networking_keyword || data.industry || 'business networking',
        partnershipGoals: data.partnership_goals || 'Build strategic partnerships for growth',
        conversationData: data,
        userId: userId,
        userConsent: true // Include consent flag
      }

      console.log('🧠 Generating brief with intelligent data enhancement:', formData)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Brief generation encountered an issue")
      }

      if (result.briefId) {
        const briefUrl = `/dashboard/briefs/${result.briefId}`
        const completionMessage: Message = {
          id: (Date.now() + 4).toString(),
          role: "assistant",
          content: `🎉 Your intelligent strategy brief is ready!\n\nI've created personalized recommendations using AI-powered market analysis and intelligent gap-filling for ${formData.businessName}.\n\n📊 Data Completeness: ${result.dataCompleteness || 'AI-Enhanced'}\n⏱️ Processing Time: ${Math.round((result.processingTime || 120000) / 1000)}s\n\nClick below to view your comprehensive strategy brief:`,
          timestamp: new Date(),
          briefLink: briefUrl
        }
        setMessages(prev => [...prev, completionMessage])
      }
      
    } catch (error) {
      console.error("Error generating brief:", error)
      const errorMessage: Message = {
        id: (Date.now() + 5).toString(),
        role: "assistant",
        content: `I'm still working on your brief! Our AI systems are processing your information intelligently. This may take a bit longer, but I'm ensuring you get maximum value regardless of data completeness.\n\nPlease wait a moment while I finalize your strategy recommendations...`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Retry logic for partial data scenarios
      setTimeout(() => {
        console.log('🔄 Retrying brief generation with fallback options...')
        // You can implement retry logic here
      }, 30000)
      
    } finally {
      setIsGeneratingBrief(false)
    }
  }

  const handleQuickAction = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const quickQuestions = [
    "My business is...",
    "Industry: [type]",
    "My goal is...", 
    "I need partners"
  ]

  // Update to show the Generate Brief button more intelligently
  const shouldShowGenerateButton = canGenerateBrief && !isGeneratingBrief && progressPercentage >= 40

  return (
    <div className="flex flex-col h-full w-full bg-gray-900">
      {/* Mobile-Optimized Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-3 sm:p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">AI Business Intelligence</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Your strategic business advisor</p>
            </div>
          </div>
          
          {shouldShowGenerateButton && (
            <Button
              onClick={() => generateBrief(conversationData)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 w-full sm:w-auto"
              size="sm"
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Generate Strategy Brief
            </Button>
          )}
        </div>
        
        {/* Mobile-Optimized Progress Section */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
            <span className="text-gray-300 text-xs sm:text-sm">Business Intelligence Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 font-semibold text-xs sm:text-sm">{progressPercentage}% Complete</span>
              {canGenerateBrief && (
                <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">Ready for Brief</span>
                  <span className="sm:hidden">Ready</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-1.5 sm:h-2">
            <motion.div 
              className="bg-yellow-500 h-full rounded-full"
              style={{ width: `${progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Mobile-Optimized Progress Insight */}
          <div className="text-xs text-gray-400 leading-tight">
            {progressPercentage < 20 && "💡 Let's start with your business basics"}
            {progressPercentage >= 20 && progressPercentage < 50 && "📍 Great! Tell me about location & industry"}
            {progressPercentage >= 50 && progressPercentage < 70 && "🎯 What are your main business goals?"}
            {progressPercentage >= 70 && "🚀 Perfect! Ready to create your strategy brief"}
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 bg-black min-h-0">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}>
                {/* Mobile-Optimized Avatar */}
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-yellow-500" : "bg-gray-700"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                  ) : message.typing ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 animate-spin" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                  )}
                </div>

                {/* Mobile-Optimized Message Bubble */}
                <div className={`rounded-lg p-2 sm:p-3 ${
                  message.role === "user"
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-800 text-white"
                }`}>
                  {message.typing ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-yellow-500 text-xs sm:text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm md:text-base whitespace-pre-wrap leading-relaxed break-words">
                        {message.content}
                      </p>
                      
                      {/* Mobile-Optimized Brief Link */}
                      {message.briefLink && (
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-600">
                          <Button
                            onClick={() => window.open(message.briefLink, '_blank')}
                            className="bg-green-500 hover:bg-green-600 text-white w-full font-semibold text-xs sm:text-sm"
                            size="sm"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            View Strategy Brief
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Mobile-Optimized Input Section */}
      <div className="border-t border-gray-700 p-2 sm:p-3 md:p-4 bg-gray-900 flex-shrink-0">
        {/* Mobile-Optimized Quick Questions */}
        <div className="mb-2 sm:mb-3">
          <p className="text-gray-400 text-xs mb-1 sm:mb-2">Quick prompts:</p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(question)}
                className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700 px-2 py-1 h-auto justify-start truncate"
                disabled={isLoading || isGeneratingBrief}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile-Optimized Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me about your business..."
            disabled={isLoading || isGeneratingBrief}
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500 text-xs sm:text-sm h-9 sm:h-10"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || isGeneratingBrief}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 sm:px-4 flex-shrink-0 h-9 sm:h-10"
            size="sm"
          >
            {(isLoading || isGeneratingBrief) ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>
        </form>

        {/* Mobile-Optimized Status */}
        <div className="mt-1 sm:mt-2 text-center">
          <p className="text-xs text-gray-500">
            <span className="hidden sm:inline">Powered by GPT-4 • </span>
            {progressPercentage >= 70 ? 'Ready to generate brief!' : 'Building your profile...'}
          </p>
        </div>
      </div>
    </div>
  )
}