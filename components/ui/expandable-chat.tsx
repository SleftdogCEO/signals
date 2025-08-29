"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { X, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type ChatPosition = "bottom-right" | "bottom-left"
export type ChatSize = "sm" | "md" | "lg" | "xl" | "full"

// ✅ Create separate interface to avoid conflicts with HTMLAttributes
interface ExpandableChatBaseProps {
  position?: ChatPosition
  size?: ChatSize
  icon?: React.ReactNode
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void // ✅ Changed from onToggle to onOpenChange
  children?: React.ReactNode
  className?: string
}

// ✅ Don't extend HTMLAttributes to avoid onToggle conflict
interface ExpandableChatProps extends ExpandableChatBaseProps {}

const chatConfig = {
  positions: {
    "bottom-right": "bottom-4 right-4 md:bottom-5 md:right-5",
    "bottom-left": "bottom-4 left-4 md:bottom-5 md:left-5",
  },
  chatPositions: {
    "bottom-right": "sm:bottom-[calc(100%+10px)] sm:right-0 md:bottom-[calc(100%+12px)] md:right-0",
    "bottom-left": "sm:bottom-[calc(100%+10px)] sm:left-0 md:bottom-[calc(100%+12px)] md:left-0",
  },
  states: {
    open: "pointer-events-auto opacity-100 visible scale-100 translate-y-0",
    closed: "pointer-events-none opacity-0 invisible scale-95 translate-y-2",
  },
}

const ExpandableChat: React.FC<ExpandableChatProps> = ({
  className,
  position = "bottom-right",
  size = "md", 
  icon,
  open: controlledOpen,
  onOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

  const toggleChat = () => {
    const newState = !isOpen
    if (controlledOpen !== undefined && onOpenChange) {
      onOpenChange(newState)
    } else {
      setInternalOpen(newState)
    }
  }

  return (
    <div className={cn(
      "fixed z-[9999]",
      position === "bottom-right" ? "bottom-4 right-4" : "bottom-4 left-4",
      className
    )}>
      {/* Mobile backdrop */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          onClick={toggleChat}
        />
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          ref={chatRef}
          className={cn(
            "flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800/50 shadow-2xl overflow-hidden backdrop-blur-xl",
            // Mobile: full screen
            isMobile ? "fixed inset-0 w-full h-full rounded-none z-[9999]" : 
            // Desktop: positioned window
            "absolute bottom-16 right-0 w-[400px] h-[600px] rounded-2xl z-[9999]"
          )}
        >
          {children}
        </div>
      )}

      {/* Toggle button */}
      <ExpandableChatToggle 
        icon={icon} 
        toggleChat={toggleChat}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg",
          isOpen && isMobile && "z-[10000]" // Ensure button is above mobile modal
        )}
      />
    </div>
  )
}

ExpandableChat.displayName = "ExpandableChat"

const ExpandableChatHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "flex items-center justify-between p-3 md:p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 via-yellow-500/10 to-gray-900 shrink-0",
      className,
    )}
    {...props}
  />
)

ExpandableChatHeader.displayName = "ExpandableChatHeader"

const ExpandableChatBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex-1 overflow-hidden", className)} {...props} />
)

ExpandableChatBody.displayName = "ExpandableChatBody"

const ExpandableChatFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("border-t border-gray-800/50 p-3 md:p-4 bg-gray-900/95 shrink-0", className)} {...props} />
)

ExpandableChatFooter.displayName = "ExpandableChatFooter"

interface ExpandableChatToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  toggleChat: () => void
}

const ExpandableChatToggle: React.FC<ExpandableChatToggleProps> = ({
  className,
  icon,
  toggleChat,
  ...props
}) => (
  <Button
    onClick={toggleChat}
    className={cn(
      "w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shrink-0 active:scale-95",
      className,
    )}
    {...props}
  >
    {icon || <MessageCircle className="h-6 w-6" />}
  </Button>
)

ExpandableChatToggle.displayName = "ExpandableChatToggle"

export { ExpandableChat, ExpandableChatHeader, ExpandableChatBody, ExpandableChatFooter }