import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(({ className, ...props }, ref) => (
  <Textarea
    autoComplete="off"
    ref={ref}
    name="message"
    className={cn(
      "max-h-12 px-4 py-3 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-yellow-500/20 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none transition-all duration-200",
      className,
    )}
    {...props}
  />
))
ChatInput.displayName = "ChatInput"

export { ChatInput }
