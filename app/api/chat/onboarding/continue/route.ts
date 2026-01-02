import { NextResponse } from 'next/server'

// Simple conversation memory store
const conversationMemory = new Map()

// Simple keyword extraction for mock mode (no OpenAI needed)
function extractBusinessDataFromMessage(message: string, existingData: any = {}) {
  const data = { ...existingData }
  const msgLower = message.toLowerCase()

  // Extract business name patterns
  const namePatterns = [
    /(?:my (?:business|company|shop|store|restaurant|gym|studio) (?:is |called |named )?["']?([^"'\n,]+)["']?)/i,
    /(?:i (?:run|own|have|manage) (?:a )?["']?([^"'\n,]+)["']?)/i,
    /(?:called |named )["']?([^"'\n,]+)["']?/i,
  ]
  for (const pattern of namePatterns) {
    const match = message.match(pattern)
    if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
      data.business_name = match[1].trim()
      break
    }
  }

  // Extract industry
  const industries = ['restaurant', 'fitness', 'gym', 'wellness', 'retail', 'tech', 'technology', 'healthcare', 'real estate', 'consulting', 'marketing', 'beauty', 'salon', 'spa', 'cafe', 'coffee', 'bar', 'hotel', 'agency', 'ecommerce', 'e-commerce']
  for (const ind of industries) {
    if (msgLower.includes(ind)) {
      data.industry = ind.charAt(0).toUpperCase() + ind.slice(1)
      break
    }
  }

  // Extract location - look for city names or "in [location]" pattern
  const locationMatch = message.match(/(?:in |at |from |based in )([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2})?)/i)
  if (locationMatch) {
    data.location = locationMatch[1].trim()
  }

  // Extract goals
  if (msgLower.includes('partner') || msgLower.includes('collaboration')) {
    data.custom_goal = message.substring(0, 100)
  }
  if (msgLower.includes('grow') || msgLower.includes('expand') || msgLower.includes('more customer')) {
    data.custom_goal = message.substring(0, 100)
  }

  return data
}

function calculateProgress(data: any): number {
  if (!data || Object.keys(data).length === 0) return 0

  const essentialFields = ['business_name', 'industry', 'location', 'custom_goal']
  const filledFields = essentialFields.filter(field =>
    data[field] && data[field] !== "NOT_PROVIDED" && data[field] !== null
  ).length

  return Math.round((filledFields / essentialFields.length) * 100)
}

export async function POST(req: Request) {
  try {
    const { userId, userMessage } = await req.json()

    // Get conversation memory
    const memoryKey = `${userId}_conversation`
    let memory = conversationMemory.get(memoryKey) || {
      messages: [],
      businessInfo: {},
      userConsent: false,
      totalMessages: 0,
      businessDataCollectionStarted: false
    }

    // Add current message to memory
    memory.messages.push({ role: "user", content: userMessage, timestamp: new Date() })
    memory.totalMessages += 1

    // Extract business data using simple pattern matching (no OpenAI needed)
    const extractedData = extractBusinessDataFromMessage(userMessage, memory.businessInfo)

    // Check if any business data was found
    const hasNewData = Object.keys(extractedData).some(key =>
      extractedData[key] && extractedData[key] !== memory.businessInfo[key]
    )

    if (hasNewData) {
      memory.businessDataCollectionStarted = true
      memory.businessInfo = { ...memory.businessInfo, ...extractedData }
      console.log('✅ Extracted business data:', extractedData)
    }

    // Generate contextual response
    let responseMessage = ''
    const info = memory.businessInfo

    if (!info.business_name) {
      responseMessage = "I'd love to help you! What's the name of your business?"
    } else if (!info.industry) {
      responseMessage = `Great, ${info.business_name}! What industry are you in? (e.g., restaurant, fitness, retail, tech, etc.)`
    } else if (!info.location) {
      responseMessage = `Perfect! Where is ${info.business_name} located? (City, State)`
    } else if (!info.custom_goal) {
      responseMessage = `Awesome! What's your main goal right now? (e.g., find partners, get more customers, expand)`
    } else {
      responseMessage = `Great! I have everything I need to generate your strategy brief for ${info.business_name}. Click "Generate Brief" when you're ready!`
    }

    // Calculate progress
    const progress = calculateProgress(memory.businessInfo)

    // Save memory
    memory.messages.push({ role: "assistant", content: responseMessage, timestamp: new Date() })
    conversationMemory.set(memoryKey, memory)

    return NextResponse.json({
      success: true,
      message: responseMessage,
      data_collected: memory.businessInfo,
      conversation_insights: `Message ${memory.totalMessages}: ${hasNewData ? 'Business data extracted' : 'Awaiting info'}`,
      can_generate_brief: progress >= 75,
      progress_percentage: progress,
      brief_generation_trigger: false,
      is_business_data_collection: hasNewData
    })

  } catch (error: any) {
    console.error('Chat error:', error)

    return NextResponse.json({
      success: true,
      message: "I'm here to help! What's the name of your business?",
      data_collected: {},
      conversation_insights: "Error recovery mode",
      can_generate_brief: false,
      progress_percentage: 0,
      brief_generation_trigger: false,
      is_business_data_collection: false
    })
  }
}

export function cleanupConversationMemory() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)

  for (const [key, data] of conversationMemory.entries()) {
    const lastMessage = (data as any).messages?.slice(-1)[0]?.timestamp
    if (lastMessage && new Date(lastMessage).getTime() < oneHourAgo) {
      conversationMemory.delete(key)
    }
  }
}
