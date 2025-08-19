"use client"

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles, Mic, Bot, User, CornerDownLeft, Paperclip, MicOff, X, Play } from "lucide-react"
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import { ChatMessageList } from "@/components/ui/chat-message-list"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: number
  role: "user" | "assistant" | "avatar" | "system"
  content: string
  timestamp: Date
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export function EnhancedChatWidget() {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hi! I'm your AI assistant. Ask me anything about business strategy!",
      role: "assistant",
      timestamp: new Date(),
    },
  ])

  const [avatarMessages, setAvatarMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your interactive avatar assistant. Send me a message to get started!",
      role: "avatar",
      timestamp: new Date(),
    }
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("ai")
  
  // Avatar states - simplified
  const [isAvatarConnected, setIsAvatarConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  
  // Refs for avatar management - following Vite pattern
  const avatarRef = useRef<StreamingAvatar | null>(null)
  const sessionDataRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInitializingRef = useRef(false)

  // Helper function to fetch access token - similar to Vite example
  const fetchAccessToken = useCallback(async (): Promise<string> => {
    const response = await fetch('/api/heygen/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch token')
    }

    const { token } = await response.json()
    return token
  }, [])

  // Handle when avatar stream is ready - exactly like Vite example
  const handleStreamReady = useCallback((event: any) => {
    console.log('🎥 Stream ready event received')
    if (event.detail && videoRef.current) {
      videoRef.current.srcObject = event.detail
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().then(() => {
          console.log('▶️ Video playing')
          setIsAvatarConnected(true)
          setIsConnecting(false)
          toast.success('Avatar connected!')
        }).catch(console.error)
      }
    } else {
      console.error("Stream is not available")
    }
  }, [])

  // Handle stream disconnection - exactly like Vite example
  const handleStreamDisconnected = useCallback(() => {
    console.log("❌ Stream disconnected")
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsAvatarConnected(false)
    setStreamError('Avatar disconnected')
  }, [])

  // Initialize streaming avatar session - following Vite pattern exactly
  const initializeAvatarSession = useCallback(async () => {
    if (isInitializingRef.current) {
      console.log('⏭️ Already initializing')
      return
    }

    isInitializingRef.current = true
    
    try {
      setIsConnecting(true)
      setStreamError(null)
      
      console.log('🚀 Initializing avatar session...')
      
      // Get token
      const token = await fetchAccessToken()
      console.log('✅ Token received')
      
      // Create avatar instance
      const avatar = new StreamingAvatar({ token })
      
      // Set up event listeners BEFORE createStartAvatar
      avatar.on(StreamingEvents.STREAM_READY, handleStreamReady)
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected)
      
      // Create session - using exact same params as Vite example
      const sessionData = await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "Wayne_20240711", // Exact same as working example
        language: "en"
      })

      console.log("📊 Session data:", sessionData)

      // Store references
      avatarRef.current = avatar
      sessionDataRef.current = sessionData

      console.log('✅ Avatar session initialized successfully')

    } catch (error) {
      console.error('❌ Failed to initialize avatar session:', error)
      setStreamError(error instanceof Error ? error.message : 'Failed to initialize')
      setIsConnecting(false)
    } finally {
      isInitializingRef.current = false
    }
  }, [fetchAccessToken, handleStreamReady, handleStreamDisconnected])

  // End the avatar session - exactly like Vite example
  const terminateAvatarSession = useCallback(async () => {
    if (!avatarRef.current || !sessionDataRef.current) return

    try {
      console.log('🛑 Terminating avatar session...')
      await avatarRef.current.stopAvatar()
      
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      
      avatarRef.current = null
      sessionDataRef.current = null
      setIsAvatarConnected(false)
      
      console.log('✅ Avatar session terminated')
    } catch (error) {
      console.error('Error terminating session:', error)
    }
  }, [])

  // Handle speaking event - exactly like Vite example
  const handleAvatarSpeak = useCallback(async (text: string) => {
    if (avatarRef.current && text.trim()) {
      try {
        console.log('🗣️ Making avatar speak:', text)
        await avatarRef.current.speak({
          text: text.trim(),
          task_type: TaskType.TALK,
        })
        console.log('✅ Avatar speak command sent')
      } catch (error) {
        console.error('❌ Error making avatar speak:', error)
        throw error
      }
    }
  }, [])

  // Clean up on unmount only
  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        terminateAvatarSession()
      }
    }
  }, [terminateAvatarSession])

  // Handle tab switching - simplified logic
  useEffect(() => {
    if (activeTab === "avatar" && isOpen && !isAvatarConnected && !isConnecting) {
      // Only initialize if we're on avatar tab, chat is open, and avatar is not connected/connecting
      const timer = setTimeout(() => {
        initializeAvatarSession()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [activeTab, isOpen, isAvatarConnected, isConnecting, initializeAvatarSession])

  // Clean up when chat closes
  useEffect(() => {
    if (!isOpen && avatarRef.current) {
      terminateAvatarSession()
    }
  }, [isOpen, terminateAvatarSession])

  // Handle AI chat message
  const handleAiMessage = async (userMessage: string) => {
    try {
      setIsLoading(true)

      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      }
      setAiMessages((prev) => [...prev, userMsg])

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) throw new Error("AI response failed")

      const data = await response.json()

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }
      setAiMessages((prev) => [...prev, aiMsg])
    } catch (error) {
      console.error('AI message error:', error)
      toast.error("Failed to get AI response")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle avatar chat message - simplified
  const handleAvatarMessage = async (userMessage: string) => {
    try {
      setIsLoading(true)

      // Add user message immediately
      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      }
      setAvatarMessages(prev => [...prev, userMsg])

      // If avatar is not connected, try to initialize it first
      if (!isAvatarConnected || !avatarRef.current) {
        console.log('Avatar not connected, initializing...')
        
        // Add system message about connecting
        const connectingMsg: Message = {
          id: Date.now() + 1,
          role: "system",
          content: "Connecting to avatar...",
          timestamp: new Date(),
        }
        setAvatarMessages(prev => [...prev, connectingMsg])
        
        // Initialize avatar
        await initializeAvatarSession()
        
        // Wait for connection with timeout
        let waitTime = 0
        const maxWait = 30000 // 30 seconds
        
        while (!isAvatarConnected && waitTime < maxWait) {
          await new Promise(resolve => setTimeout(resolve, 500))
          waitTime += 500
        }
        
        // Remove connecting message
        setAvatarMessages(prev => prev.filter(msg => msg.id !== connectingMsg.id))
        
        if (!isAvatarConnected || !avatarRef.current) {
          throw new Error('Failed to connect to avatar')
        }
      }

      // Make avatar speak
      await handleAvatarSpeak(userMessage)

      // Add avatar response message
      const avatarResponse: Message = {
        id: Date.now() + 2,
        role: "avatar",
        content: `Speaking: "${userMessage}"`,
        timestamp: new Date(),
      }
      setAvatarMessages(prev => [...prev, avatarResponse])

    } catch (error) {
      console.error('❌ Avatar message error:', error)
      const errorMsg: Message = {
        id: Date.now() + 3,
        role: "system",
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date()
      }
      setAvatarMessages(prev => [...prev, errorMsg])
      toast.error("Failed to send message to avatar")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput("")

    if (activeTab === "ai") {
      await handleAiMessage(message)
    } else {
      await handleAvatarMessage(message)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" 
             onClick={() => setIsOpen(false)} />
      )}
      
      <ExpandableChat
        size={isMobile ? "full" : "lg"}
        position="bottom-right"
        icon={<MessageSquare className="h-6 w-6" />}
        open={isOpen}
        onToggle={(event) => setIsOpen(event.newState === "open")} // ✅ Fixed: Handle the ToggleEvent properly
        className={cn(
          isMobile 
            ? "!fixed !inset-4 !m-0 !w-auto !h-auto !max-w-none !max-h-none z-[9999]" 
            : "max-w-[400px] lg:max-w-[500px] z-[1000]"
        )}
      >
        <div className={cn(
          "flex flex-col h-full overflow-hidden",
          "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950",
          "rounded-lg border border-gray-800/50 shadow-2xl",
          isMobile && "min-h-[100vh] sm:min-h-[600px]"
        )}>        
          <ExpandableChatHeader className={cn(
            "flex-row items-center justify-between bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10 px-4 py-3 border-b border-gray-800/50",
            isMobile && "flex-row"
          )}>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Sleft Assistant
              </h1>
              <p className="text-xs text-gray-400">AI-powered business insights</p>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </ExpandableChatHeader>

          <ExpandableChatBody className="flex-1 flex flex-col overflow-hidden">
            <Tabs
              value={activeTab}
              className="flex-1 flex flex-col h-full"
              onValueChange={setActiveTab}
            >
              <TabsList className={cn(
                "w-full sticky top-0 z-10 px-4 pt-4 pb-2 bg-gray-900/95 backdrop-blur-sm",
                isMobile && "px-3"
              )}>
                <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg w-full">
                  <TabsTrigger
                    value="ai"
                    className={cn(
                      "flex-1 py-2.5 px-2 rounded-md transition-all text-xs sm:text-sm font-medium",
                      "data-[state=active]:bg-yellow-500",
                      "data-[state=active]:text-black",
                      "data-[state=inactive]:text-gray-400",
                      "data-[state=inactive]:hover:bg-gray-800/50"
                    )}
                  >
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="avatar"
                    className={cn(
                      "flex-1 py-2.5 px-2 rounded-md transition-all text-xs sm:text-sm font-medium",
                      "data-[state=active]:bg-yellow-500",
                      "data-[state=active]:text-black",
                      "data-[state=inactive]:text-gray-400",
                      "data-[state=inactive]:hover:bg-gray-800/50"
                    )}
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Video </span>Avatar
                    {isConnecting && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse ml-1" />
                    )}
                    {isAvatarConnected && (
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
                    )}
                  </TabsTrigger>
                </div>
              </TabsList>

              <TabsContent value="ai" className="flex-1 overflow-hidden px-3 sm:px-4">
                <ChatMessageList className={cn("h-full pt-2 sm:pt-4", isMobile && "pb-4")}>
                  {aiMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChatBubble
                        variant={message.role === "user" ? "sent" : "received"}
                      >
                        <ChatBubbleAvatar
                          className="h-6 w-6 sm:h-8 sm:w-8 shrink-0"
                          src={message.role === "user" ? "/avatars/user-avatar.png" : "/avatars/ai-avatar.png"}
                          fallback={message.role === "user" ? "U" : "AI"}
                        />
                        <ChatBubbleMessage 
                          variant={message.role === "user" ? "sent" : "received"}
                          className="text-sm sm:text-base"
                        >
                          {message.content}
                        </ChatBubbleMessage>
                      </ChatBubble>
                    </motion.div>
                  ))}

                  {isLoading && activeTab === "ai" && (
                    <ChatBubble variant="received">
                      <ChatBubbleAvatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" src="/ai-avatar.png" fallback="AI" />
                      <ChatBubbleMessage isLoading />
                    </ChatBubble>
                  )}
                </ChatMessageList>
              </TabsContent>

              <TabsContent value="avatar" className="flex-1 flex flex-col overflow-hidden">
                {/* Video container */}
                <div className="flex-shrink-0 p-2 sm:p-4 bg-gradient-to-b from-gray-900/50 to-gray-950/50">
                  <div className={cn(
                    "relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black",
                    "w-full shadow-2xl ring-1 ring-gray-700/50",
                    isMobile ? "aspect-video" : "aspect-video"
                  )}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted={false}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Connection Status Overlay */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-sm">
                      {isConnecting && (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                          Connecting...
                        </span>
                      )}
                      {isAvatarConnected && (
                        <span className="text-green-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          Ready
                        </span>
                      )}
                      {streamError && (
                        <span className="text-red-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          Error
                        </span>
                      )}
                    </div>

                    {/* Loading state */}
                    <AnimatePresence>
                      {isConnecting && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-black/50"
                        >
                          <div className="flex flex-col items-center gap-4 text-center p-4 sm:p-6">
                            <div className="relative">
                              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-yellow-500/20 border-t-yellow-500" />
                            </div>
                            <p className="text-base sm:text-lg text-white font-medium">
                              Connecting avatar...
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error state */}
                    <AnimatePresence>
                      {streamError && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/40"
                        >
                          <div className="text-center p-4 sm:p-6 max-w-sm mx-auto">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full" />
                            </div>
                            <p className="text-sm sm:text-base text-red-300 mb-4 font-medium">{streamError}</p>
                            <Button 
                              onClick={() => {
                                setStreamError(null)
                                initializeAvatarSession()
                              }}
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                            >
                              Try Again
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Waiting state */}
                    <AnimatePresence>
                      {!isAvatarConnected && !isConnecting && !streamError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-b from-black/40 to-black/60"
                        >
                          <div className="text-center p-4 sm:p-6">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.05, 1],
                                opacity: [0.8, 1, 0.8]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-yellow-500/20"
                            >
                              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 ml-1" />
                            </motion.div>
                            <h3 className="text-lg sm:text-xl text-white font-semibold mb-2">Avatar Ready</h3>
                            <p className="text-sm text-gray-300 max-w-xs mx-auto">
                              Send a message to start conversation
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Chat messages area */}
                <div className="flex-1 overflow-hidden px-3 sm:px-4 pb-2">
                  <div className="h-full">
                    <ChatMessageList className="h-full">
                      {avatarMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChatBubble
                            variant={message.role === "user" ? "sent" : "received"}
                          >
                            <ChatBubbleAvatar
                              className="h-6 w-6 sm:h-8 sm:w-8 shrink-0"
                              src={message.role === "user" ? "/avatars/user-avatar.png" : "/avatars/ai-avatar.png"}
                              fallback={message.role === "user" ? "U" : "A"}
                            />
                            <ChatBubbleMessage 
                              variant={message.role === "user" ? "sent" : "received"}
                              className={cn(
                                "text-sm sm:text-base",
                                message.role === "system" && "text-gray-400 italic"
                              )}
                            >
                              {message.content}
                            </ChatBubbleMessage>
                          </ChatBubble>
                        </motion.div>
                      ))}

                      {isLoading && activeTab === "avatar" && (
                        <ChatBubble variant="received">
                          <ChatBubbleAvatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" src="/avatars/avatar-assistant.png" fallback="A" />
                          <ChatBubbleMessage isLoading />
                        </ChatBubble>
                      )}
                    </ChatMessageList>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ExpandableChatBody>

          <ExpandableChatFooter className="bg-gray-900/95 backdrop-blur-sm sticky bottom-0 z-10 border-t border-gray-800/50">
            <form
              onSubmit={handleSubmit}
              className="relative rounded-lg border border-gray-700/50 bg-gray-800/50 focus-within:ring-1 focus-within:ring-yellow-500/30 focus-within:border-yellow-500/50 p-1 m-2 sm:m-3 transition-all duration-200"
            >
              <ChatInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTab === "ai" 
                    ? "Ask me anything..." 
                    : isAvatarConnected
                      ? "Chat with your avatar..." 
                      : isConnecting
                        ? "Connecting..."
                        : "Send a message to start..."
                }
                className={cn(
                  "resize-none rounded-lg bg-transparent border-0 p-2 sm:p-3 shadow-none focus-visible:ring-0 text-sm sm:text-base placeholder:text-gray-500",
                  isMobile ? "min-h-10" : "min-h-12"
                )}
                disabled={isLoading || (activeTab === "avatar" && isConnecting)}
              />
              <div className="flex items-center p-2 sm:p-3 pt-0 justify-between">
                <div className="flex items-center gap-1">
                  {activeTab === "avatar" && isAvatarConnected && (
                    <Button
                      onClick={terminateAvatarSession}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 text-xs"
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
                
                <Button
                  type="submit"
                  size={isMobile ? "sm" : "sm"}
                  className={cn(
                    "ml-auto gap-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shadow-lg shadow-yellow-500/20 transition-all duration-200 font-medium",
                    isMobile && "text-xs px-3 py-1.5"
                  )}
                  disabled={isLoading || !input.trim() || (activeTab === "avatar" && !isAvatarConnected)}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full"
                      />
                      <span className="hidden sm:inline">Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Send</span>
                      <CornerDownLeft className="size-3 sm:size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </ExpandableChatFooter>
        </div>
      </ExpandableChat>
    </>
  )
}
