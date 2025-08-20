"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BentoGrid } from "@/components/ui/bento-grid"
import { Footer7 } from "@/components/ui/footer-7"
import { Connect } from "@/components/connect-section"
import DatabaseWithRestApi from "@/components/ui/database-with-rest-api"
import { Sparkles, TrendingUp, Users, Zap, Box, Lock, Search, Settings, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useRouter } from "next/navigation"
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Pricing } from "@/components/ui/pricing"
import { Navbar1 } from "@/components/ui/navbar-1"
import { StarBorder } from "@/components/ui/star-border"
import { Sparkles as SparklesComponent } from "@/components/ui/sparkles"
import Link from "next/link"

const checkVideoFile = async () => {
  try {
    const response = await fetch('/avatars/Quick-Avatar-Video.mp4', { method: 'HEAD' })
    console.log('Video file status:', response.status)
    if (!response.ok) {
      console.error('Video file not found or inaccessible')
    }
  } catch (error) {
    console.error('Error checking video file:', error)
  }
}

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [canAutoplay, setCanAutoplay] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check autoplay capability - Fixed dependency array
  useEffect(() => {
    const checkAutoplay = async () => {
      try {
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current.volume = 0
          const playPromise = videoRef.current.play()
          if (playPromise) {
            await playPromise
            videoRef.current.pause()
            videoRef.current.currentTime = 0
            setCanAutoplay(true)
          }
        }
      } catch (error) {
        console.log("Autoplay not allowed:", error)
        setCanAutoplay(false)
      }
    }

    const timer = setTimeout(checkAutoplay, 100)
    return () => clearTimeout(timer)
  }, []) // Fixed: Keep this empty

  // Check video file on mount - Separate useEffect
  useEffect(() => {
    checkVideoFile()
  }, [])

  // User interaction handler - Fixed dependency array
  useEffect(() => {
    if (userInteracted) return // Don't add listener if already interacted

    const handleUserClick = () => {
      setUserInteracted(true)
      if (videoRef.current && isMuted && isPlaying) {
        videoRef.current.muted = false
        videoRef.current.volume = 0.7
        setIsMuted(false)
      }
    }

    document.addEventListener('click', handleUserClick, { once: true })
    return () => document.removeEventListener('click', handleUserClick)
  }, [isMuted, isPlaying, userInteracted]) // Fixed: Consistent dependencies

  const playVideo = async () => {
    if (!videoRef.current) return

    try {
      setHasError(false)
      
      // Set volume before playing
      videoRef.current.volume = isMuted ? 0 : 0.7

      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        await playPromise
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Video play error:", error)
      
      // Try playing muted if unmuted failed
      try {
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current.volume = 0
          setIsMuted(true)
          await videoRef.current.play()
          setIsPlaying(true)
        }
      } catch (mutedError) {
        console.error("Muted play error:", mutedError)
        setHasError(true)
      }
    }
  }

  const togglePlay = async () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      await playVideo()
    }
  }

  const toggleMute = async () => {
    if (!videoRef.current) return
    
    try {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      videoRef.current.volume = newMutedState ? 0 : 0.7
      setIsMuted(newMutedState)
    } catch (error) {
      console.error("Toggle mute error:", error)
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e)
    setHasError(true)
    setIsLoaded(false)
  }

  const handleLoadedData = () => {
    console.log("Video loaded successfully")
    setIsLoaded(true)
    setHasError(false)
  }

  const handleCanPlay = () => {
    console.log("Video can play")
    setIsLoaded(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 mb-12 group"
    >
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-yellow-500/20 shadow-2xl bg-black/50 backdrop-blur-sm">
        {/* Video Preview Overlay */}
        {(!isPlaying || hasError) && (
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/60">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-4"
              >
                <h3 className="text-lg sm:text-2xl font-bold mb-2 text-yellow-500">
                  {hasError ? "Video Error" : "Watch Our AI in Action"}
                </h3>
                <p className="text-xs sm:text-base text-gray-200 max-w-md mx-auto">
                  {hasError 
                    ? "Unable to load video. Please check your connection." 
                    : "See how Sleft Signals transforms your business strategy"}
                </p>
              </motion.div>
              {!hasError && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={togglePlay}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/90 hover:bg-yellow-500 flex items-center justify-center text-black transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full aspect-video object-cover"
          poster="/avatars/ai-avatar.png"
          playsInline
          preload="metadata"
          muted={isMuted}
          onLoadedData={handleLoadedData}
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
          onEnded={() => setIsPlaying(false)}
          controls={false}
          disablePictureInPicture
          controlsList="nodownload"
        >
          <source 
            src="/avatars/Quick-Avatar-Video.mp4" 
            type="video/mp4"
          />
          <p>Your browser does not support the video tag.</p>
        </video>

        {/* Mobile Touch Area */}
        <button
          className="absolute inset-0 w-full h-full z-20 opacity-0"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        />

        {/* Unmute Notification */}
        {isPlaying && isMuted && (
          <div className="absolute top-4 right-4 z-30">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={toggleMute}
              className="bg-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-yellow-400 transition-colors shadow-lg"
            >
              <Volume2 className="w-3 h-3" />
              Tap to unmute
            </motion.button>
          </div>
        )}

        {/* Controls when playing */}
        {isPlaying && !hasError && (
          <>
            {/* Center Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-25">
              <button
                onClick={togglePlay}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/90 hover:bg-yellow-500 flex items-center justify-center text-black transition-transform duration-200 hover:scale-110 shadow-lg"
              >
                <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors duration-200"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                )}
              </button>

              {/* Video Progress Indicator */}
              <div className="text-xs text-white/70">
                {isPlaying ? "Playing" : "Paused"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl sm:rounded-2xl z-30">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Loading video...</p>
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="mt-2 text-center">
        <p className="text-xs sm:text-sm text-gray-400">
          {hasError 
            ? "Video failed to load - please refresh" 
            : !isLoaded 
            ? "Loading..." 
            : isPlaying 
            ? "Playing" 
            : "Click to play"
          }
        </p>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const router = useRouter()

  const handleGenerateBrief = () => {
    router.push("/generate")
  }

  const handleWatchDemo = () => {
    // Add demo functionality or scroll to demo section
    console.log("Watch demo clicked")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar1 />
      </div>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden pt-16 sm:pt-24 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="text-xs sm:text-sm text-yellow-500 font-medium">AI-Powered Business Intelligence</span>
            </div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Transform your business with{" "}
              <span className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                AI-powered insights
              </span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Get personalized business strategy briefs that reveal your competitive edge, growth opportunities, and
              valuable connections. Powered by GPT-4 and real business intelligence.
            </motion.p>
          </motion.div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-4xl mx-auto mb-12 sm:mb-16 px-4"
          >
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </div>
              <span className="text-gray-300 text-base sm:text-lg font-medium">Your Edge</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </div>
              <span className="text-gray-300 text-base sm:text-lg font-medium">Your Leverage</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </div>
              <span className="text-gray-300 text-base sm:text-lg font-medium">Your Connections</span>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center"
          >
            {/* Add VideoPlayer here */}
            <VideoPlayer />

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link href="/auth" passHref>
              <StarBorder
                as="button"
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                color="#fbbf24"
                speed="4s"
              >
                <div className="flex items-center gap-3 font-semibold text-lg text-yellow-500">
                  <Sparkles className="w-5 h-5" />
                  Generate My Strategy Brief
                </div>
              </StarBorder>
              </Link>

              <Button
                onClick={handleWatchDemo}
                variant="outline"
                size="lg"
                className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 bg-transparent px-8 py-4 text-lg h-auto cursor-pointer"
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Curved Shadow Effect with Sparkles */}
        <div className="absolute -bottom-32 left-0 right-0 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
          {/* Background gradient */}
          <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#fbbf24,transparent_70%)] before:opacity-40" />
          
          {/* Curved surface */}
          <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-yellow-500/20 bg-black" />
          
          {/* Sparkles effect */}
          <SparklesComponent
            density={800}
            className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
            color="#fbbf24"
            size={1.2}
            speed={0.8}
            opacity={0.6}
          />
        </div>
      </section>

      {/* AI Intelligence Section */}
      <section className="py-20 relative z-10 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Powered by{" "}
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Advanced AI
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI analyzes your business data, market trends, and competitive landscape to deliver actionable
              insights.
            </p>
          </motion.div>

          <div className="flex justify-center">
            <DatabaseWithRestApi
              title="AI-Powered Business Intelligence"
              circleText="GPT-4"
              badgeTexts={{
                first: "EDGE",
                second: "LEVERAGE",
                third: "CONNECT",
                fourth: "SCALE",
              }}
              buttonTexts={{
                first: "Sleft Signals",
                second: "AI_Insights",
              }}
              lightColor="#fbbf24"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                grow faster
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From competitive analysis to strategic partnerships, we provide the insights and connections you need.
            </p>
          </motion.div>

          <BentoGrid
            items={[
              {
                title: "Competitive Analysis",
                description: "Understand your competitors and market trends with AI-driven insights.",
                icon: <TrendingUp className="w-6 h-6 text-yellow-500" />,
              },
              {
                title: "Growth Opportunities",
                description: "Identify new markets and revenue streams tailored to your business.",
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
              },
              {
                title: "Strategic Connections",
                description: "Find valuable partners and connections to accelerate your growth.",
                icon: <Users className="w-6 h-6 text-yellow-500" />,
              },
              {
                title: "Data Security",
                description: "Your business data is protected with enterprise-grade security.",
                icon: <Lock className="w-6 h-6 text-yellow-500" />,
              },
              {
                title: "Custom Insights",
                description: "Receive personalized recommendations and strategies from AI.",
                icon: <Settings className="w-6 h-6 text-yellow-500" />,
              },
              {
                title: "Real-time Market Data",
                description: "Stay ahead with up-to-date intelligence and analytics.",
                icon: <Search className="w-6 h-6 text-yellow-500" />,
              },
            ]}
          />
        </div>
      </section>

      {/* Glowing Effect Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Powerful{" "}
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                AI Features
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the advanced capabilities that make Sleft Signals the ultimate business intelligence platform.
            </p>
          </motion.div>

          <GlowingEffectDemo />
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black">
        <div className="container mx-auto">
          <PricingSection />
        </div>
      </section>

      {/* Connect Section */}
      <section id="contact">
        <Connect />
      </section>

      {/* Footer */}
      <Footer7 />
    </div>
  )
}

function TestimonialsSection() {
  return (
    <section className="bg-black my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-yellow-500/30 bg-yellow-500/10 py-1 px-4 rounded-lg">
              <span className="text-yellow-500">Testimonials</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-white">
            What our users say
          </h2>
          <p className="text-center mt-5 opacity-75 text-gray-300">
            See what our customers have to say about transforming their businesses with AI-powered insights.
          </p>
        </motion.div>
        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn duration={15} />
          <TestimonialsColumn className="hidden md:block" duration={19} />
          <TestimonialsColumn className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  )
}

function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Box className="h-4 w-4 text-yellow-500" />}
        title="AI-Powered Analysis"
        description="Advanced algorithms analyze your business data to uncover hidden opportunities and competitive advantages."
      />
      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Settings className="h-4 w-4 text-yellow-500" />}
        title="Strategic Recommendations"
        description="Get personalized, actionable strategies tailored to your specific business needs and market position."
      />
      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Lock className="h-4 w-4 text-yellow-500" />}
        title="Secure & Private"
        description="Your business data is protected with enterprise-grade security and privacy measures."
      />
      <GridItem
        area="md:[grid-area:2/7/2/13] xl:[grid-area:1/8/2/13]"
        icon={<Sparkles className="h-4 w-4 text-yellow-500" />}
        title="Real-time Insights"
        description="Access up-to-date market intelligence and business insights powered by GPT-4."
      />
      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Search className="h-4 w-4 text-yellow-500" />}
        title="Market Intelligence"
        description="Comprehensive market analysis and competitor insights to stay ahead of the competition."
      />
    </ul>
  )
}

interface GridItemProps {
  area: string
  icon: React.ReactNode
  title: string
  description: React.ReactNode
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-yellow-500/20 p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-black/90 p-6 shadow-sm md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-yellow-500/30 bg-yellow-500/10 p-2">{icon}</div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-gray-300">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

const pricingPlans = [
  {
    name: "STARTER",
    price: "29",
    yearlyPrice: "24",
    period: "per month",
    features: [
      "1 strategy brief per month",
      "Basic business analysis",
      "Email support",
      "Market insights",
      "Competitor overview",
    ],
    description: "Perfect for small businesses getting started",
    buttonText: "Start Free Trial",
    href: "/generate",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "99",
    yearlyPrice: "79",
    period: "per month",
    features: [
      "Unlimited strategy briefs",
      "Advanced AI analysis",
      "Priority support",
      "Strategic connections",
      "Growth opportunities",
      "Partnership recommendations",
      "Custom insights",
    ],
    description: "Ideal for growing businesses and teams",
    buttonText: "Get Started",
    href: "/generate",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "299",
    yearlyPrice: "239",
    period: "per month",
    features: [
      "Everything in Professional",
      "Custom AI models",
      "Dedicated account manager",
      "White-label solutions",
      "API access",
      "Advanced integrations",
      "Custom reporting",
      "SLA agreement",
    ],
    description: "For large organizations with specific needs",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
]

function PricingSection() {
  return (
    <Pricing
      plans={pricingPlans}
      title="Simple, Transparent Pricing"
      description="Choose the plan that works for you. All plans include access to our AI-powered platform and dedicated support."
    />
  )
}
