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
  const chatRef = useRef<HTMLDivElement>(null)

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  
  const toggleChat = () => {
    const newState = !isOpen
    if (controlledOpen !== undefined && onOpenChange) {
      onOpenChange(newState) // ✅ Call parent handler
    } else {
      setInternalOpen(newState) // ✅ Update internal state
    }
  }

  // ✅ Close chat when clicking outside on mobile
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        // Only close on mobile when clicking outside
        if (window.innerWidth < 768) {
          toggleChat()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className={cn(`fixed ${chatConfig.positions[position]} z-[9999]`, className)}>
      {/* ✅ Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden"
          onClick={toggleChat}
        />
      )}

      {/* ✅ Chat Container with proper mobile positioning */}
      <div
        ref={chatRef}
        className={cn(
          // Base styles
          "flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800/50 shadow-2xl overflow-hidden transition-all duration-300 ease-out backdrop-blur-xl",
          
          // ✅ Mobile: Full screen modal with proper z-index
          "fixed inset-0 w-full h-full rounded-none z-[9999]",
          "md:absolute md:inset-auto md:rounded-2xl",
          
          // ✅ Tablet and desktop: Fixed size at bottom-right
          "md:w-[400px] md:h-[600px] md:max-w-[90vw] md:max-h-[80vh]",
          "lg:w-[450px] lg:h-[650px]",
          
          // Position relative to toggle button on larger screens
          `md:${chatConfig.chatPositions[position].split(' ').join(' md:')}`,
          
          // Size overrides
          size === "full" && "md:w-[90vw] md:h-[80vh] lg:w-[500px] lg:h-[700px]",
          size === "lg" && "md:w-[420px] md:h-[620px] lg:w-[450px] lg:h-[670px]",
          
          // ✅ State - visible when open
          isOpen ? chatConfig.states.open : chatConfig.states.closed,
        )}
      >
        {children}
      </div>

      {/* ✅ Toggle Button - only show when closed */}
      {!isOpen && <ExpandableChatToggle icon={icon} toggleChat={toggleChat} />}
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