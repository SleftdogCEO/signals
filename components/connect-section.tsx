"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAnimate } from "framer-motion"
import { Button, buttonVariants } from "@/components/ui/button"
import { HighlighterItem, HighlightGroup, Particles } from "@/components/ui/highlighter"
import { Mail, MessageCircle, Calendar, Sparkles } from "lucide-react"

export function Connect() {
  const [scope, animate] = useAnimate()
  const [isMobile, setIsMobile] = React.useState(false)

  // Handle window resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Updated animation coordinates for mobile/desktop
  React.useEffect(() => {
    const animations = isMobile ? [
      // Mobile animations with adjusted coordinates
      ["#pointer", { left: 140, top: 40 }, { duration: 0 }],
      ["#strategy", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 30, top: 82 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#strategy", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
      ["#intelligence", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 164, top: 140 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#intelligence", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
      ["#growth", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 58, top: 158 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#growth", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
      ["#connections", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 140, top: 40 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#connections", { opacity: 0.5 }, { at: "-0.3", duration: 0.1 }],
    ] : [
      // Desktop animations (original coordinates)
      ["#pointer", { left: 200, top: 60 }, { duration: 0 }],
      ["#strategy", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 50, top: 102 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#strategy", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
      ["#intelligence", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 224, top: 170 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#intelligence", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
      ["#growth", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 88, top: 198 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#growth", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
      ["#connections", { opacity: 1 }, { duration: 0.3 }],
      ["#pointer", { left: 200, top: 60 }, { at: "+0.5", duration: 0.5, ease: "easeInOut" }],
      ["#connections", { opacity: 0.5 }, { at: "-0.3", duration: 0.1 }],
    ]

    // animate(animations, {
    //   repeat: Number.POSITIVE_INFINITY,
    // })
  }, [animate, isMobile])

  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <HighlightGroup className="group">
          <div className="group/item" data-aos="fade-down">
            <HighlighterItem className="rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <div className="relative z-20 overflow-hidden rounded-xl sm:rounded-3xl border border-yellow-500/20 bg-black/90 backdrop-blur-sm">
                <Particles
                  className="absolute inset-0 -z-10 opacity-10 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                  quantity={isMobile ? 100 : 200}
                  color={"#fbbf24"}
                  vy={-0.2}
                />
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-10 p-4 sm:p-8">
                  {/* Animation Container */}
                  <div 
                    className="relative w-[280px] h-[240px] sm:w-[300px] sm:h-[270px]" 
                    ref={scope}
                  >
                    <Sparkles className="absolute left-1/2 top-1/2 h-5 w-5 sm:h-6 sm:w-6 -translate-x-1/2 -translate-y-1/2 text-yellow-500" />
                    
                    {/* Animated Labels */}
                    {["connections", "intelligence", "growth", "strategy"].map((id) => (
                      <div
                        key={id}
                        id={id}
                        className={cn(
                          "absolute rounded-2xl border border-yellow-500/40 bg-black/80 px-2 py-1.5",
                          "text-[10px] sm:text-xs opacity-50 text-yellow-500 whitespace-nowrap",
                          {
                            "bottom-12 left-14": id === "connections",
                            "left-2 top-20": id === "intelligence",
                            "bottom-20 right-1": id === "growth",
                            "right-12 top-10": id === "strategy"
                          }
                        )}
                      >
                        {id === "connections" && "Strategic Connections"}
                        {id === "intelligence" && "Business Intelligence"}
                        {id === "growth" && "Growth Opportunities"}
                        {id === "strategy" && "AI Strategy Briefs"}
                      </div>
                    ))}

                    {/* Pointer */}
                    <div id="pointer" className="absolute">
                      <svg
                        width="14"
                        height="15"
                        viewBox="0 0 12 13"
                        className="fill-yellow-500"
                        stroke="black"
                        strokeWidth="1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 5.50676L0 0L2.83818 13L6.30623 7.86537L12 5.50676V5.50676Z"
                        />
                      </svg>
                      <span className="relative -top-1 left-3 rounded-2xl bg-yellow-500 px-2 py-1 text-[10px] sm:text-xs text-black font-medium">
                        Sleft
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col items-center text-center md:text-left md:items-start max-w-[400px] space-y-4">
                    <h3 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-tight">
                      Ready to unlock your business potential?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400">
                      Get personalized strategy insights and connect with our team to accelerate your growth.
                    </p>
                    
                    {/* Buttons */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 w-full">
                      <Link href="#" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold">
                          <Calendar className="w-4 h-4 mr-2" />
                          Book a Strategy Call
                        </Button>
                      </Link>
                      
                      <div className="flex gap-2 sm:gap-3">
                        <Link
                          href="mailto:hello@sleftsignals.com"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
                          )}
                        >
                          <Mail strokeWidth={1} className="h-4 w-4 mr-2" />
                          Email Us
                        </Link>
                        
                        <Link
                          href="#"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "icon" }),
                            "border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
                          )}
                        >
                          <MessageCircle strokeWidth={1} className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </HighlighterItem>
          </div>
        </HighlightGroup>
      </div>
    </section>
  )
}
