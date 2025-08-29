import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Conversation memory store (in production, use Redis or database)
const conversationMemory = new Map()

const responseSchema = {
  name: "BusinessIntelligenceResponse",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      message: { type: "string" },
      data_collected: {
        type: "object",
        properties: {
          business_name: { type: ["string", "null"] },
          website_url: { type: ["string", "null"] },
          industry: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          partnership_goals: { type: ["string", "null"] },
          growth_objectives: { type: ["string", "null"] },
          custom_goal: { type: ["string", "null"] },
          networking_keyword: { type: ["string", "null"] }
        },
        additionalProperties: false
      },
      conversation_insights: { type: "string" },
      can_generate_brief: { type: "boolean" },
      progress_percentage: { type: "number" },
      brief_generation_trigger: { type: "boolean" },
      missing_info_strategy: { type: ["string", "null"] }
    },
    required: ["message", "data_collected", "conversation_insights", "can_generate_brief", "progress_percentage", "brief_generation_trigger"]
  },
  strict: true
}

export async function POST(req: Request) {
  let conversationData = {}
  try {
    const { userId, userMessage, conversationData: reqConversationData, messageHistory } = await req.json()
    conversationData = reqConversationData

    // Get or create conversation memory
    const memoryKey = `${userId}_conversation`
    let conversationMemoryData = conversationMemory.get(memoryKey) || {
      totalMessages: 0,
      keyInsights: [],
      userPersonality: "unknown",
      informationGaps: [],
      conversationFlow: []
    }

    const systemPrompt = `You are an elite AI business strategist for Sleft Signals with advanced conversation memory and intelligent gap-filling capabilities.

CORE MISSION: Help users even when they have incomplete information or answer "No" / "Don't know" to questions.

CURRENT CONVERSATION DATA: ${JSON.stringify(conversationData, null, 2)}

CONVERSATION MEMORY: ${JSON.stringify(conversationMemoryData, null, 2)}

INTELLIGENT DATA COLLECTION STRATEGY:
1. ✅ ESSENTIAL MINIMUM (40% progress): business_name OR industry + location
2. ✅ GOOD ENOUGH (70% progress): business_name + industry + location + (any goal/objective)
3. ✅ OPTIMAL (100% progress): All fields completed

HANDLING "NO" / "DON'T KNOW" RESPONSES:
- If no website: Set to "none" and suggest online presence strategies
- If no custom goal: Extract from conversation context or provide growth recommendations
- If no partnerships: Focus on networking and lead generation
- If vague industry: Help narrow down based on business activities
- If unclear location: Ask for city/region for local market analysis

BRIEF GENERATION TRIGGERS:
✅ User explicitly asks for brief generation
✅ 40%+ progress + user seems ready to move forward
✅ User expresses frustration with questions → Generate with available data
✅ 5+ message exchanges → Offer brief generation option

CONVERSATION INTELLIGENCE:
- Remember user preferences and communication style
- Build on previous answers to fill gaps intelligently
- Use context clues to infer missing information
- Provide value even with minimal data

RESPONSE REQUIREMENTS:
- Always be helpful and forward-moving
- Never get stuck on missing information
- Offer brief generation when appropriate
- Use AI intelligence to fill reasonable gaps`

    // Build conversation context with memory
    const messages = [
      { role: "system", content: systemPrompt },
      ...messageHistory.slice(-8), // More context for better memory
      { role: "user", content: userMessage }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_schema", json_schema: responseSchema },
      temperature: 0.7,
      max_tokens: 1200,
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')

    // Update conversation memory
    conversationMemoryData.totalMessages += 1
    conversationMemoryData.conversationFlow.push({
      userMessage,
      aiResponse: response.message,
      timestamp: new Date().toISOString(),
      dataCollected: Object.keys(response.data_collected).filter(key => 
        response.data_collected[key] && 
        response.data_collected[key] !== "NOT YET ANSWERED" && 
        response.data_collected[key] !== "none"
      )
    })

    // Extract insights for future use
    if (userMessage.toLowerCase().includes("no") || userMessage.toLowerCase().includes("don't know")) {
      conversationMemoryData.informationGaps.push({
        question: "missing_info",
        userResponse: userMessage,
        timestamp: new Date().toISOString()
      })
    }

    conversationMemory.set(memoryKey, conversationMemoryData)

    // Enhanced progress calculation that handles gaps
    const enhancedProgress = calculateIntelligentProgress(response.data_collected, conversationMemoryData)
    response.progress_percentage = enhancedProgress

    // Intelligent brief generation check
    const canGenerate = checkIntelligentBriefGeneration(
      response.data_collected, 
      conversationMemoryData, 
      enhancedProgress,
      userMessage
    )
    response.can_generate_brief = canGenerate

    return NextResponse.json({
      success: true,
      ...response,
      conversationMemoryId: memoryKey
    })

  } catch (error: any) {
    console.error('Onboarding continue error:', error)
    
    return NextResponse.json({
      success: true,
      message: "I understand you might not have all the details right now. That's perfectly fine! I can work with whatever information you have and still create a valuable strategy brief. What's most important is helping your business grow. Would you like me to generate a brief based on what we've discussed so far?",
      data_collected: conversationData || {},
      conversation_insights: "User may have limited information - focusing on value delivery",
      can_generate_brief: true, // Always offer brief generation as fallback
      progress_percentage: Math.max(calculateBasicProgress(conversationData), 40),
      brief_generation_trigger: false,
      missing_info_strategy: "ai_assisted_completion"
    })
  }
}

function calculateIntelligentProgress(data: any, memory: any): number {
  let score = 0
  
  // Essential minimum (40 points total)
  if (data.business_name && data.business_name !== "NOT YET ANSWERED") score += 20
  if (data.industry && data.industry !== "NOT YET ANSWERED") score += 15
  if (data.location && data.location !== "NOT YET ANSWERED") score += 15
  
  // Valuable additions (30 points total)  
  if (data.custom_goal && data.custom_goal !== "NOT YET ANSWERED") score += 15
  if (data.networking_keyword && data.networking_keyword !== "NOT YET ANSWERED") score += 10
  if (data.website_url && data.website_url !== "NOT YET ANSWERED" && data.website_url !== "none") score += 5
  
  // Conversation quality bonus (30 points total)
  const messageCount = memory.totalMessages || 0
  const engagementBonus = Math.min(messageCount * 3, 15) // Up to 15 points for engagement
  const insightsBonus = Math.min((memory.keyInsights?.length || 0) * 5, 15) // Up to 15 for insights
  
  score += engagementBonus + insightsBonus
  
  return Math.min(score, 100)
}

function checkIntelligentBriefGeneration(data: any, memory: any, progress: number, userMessage: string): boolean {
  // Minimum viable data check
  const hasBusinessIdentity = data.business_name || data.industry
  const hasLocation = data.location && data.location !== "NOT YET ANSWERED"
  const hasMinimumData = hasBusinessIdentity && hasLocation
  
  // Conversation-based triggers
  const messageCount = memory.totalMessages || 0
  const userWantsGeneration = userMessage.toLowerCase().includes("generate") || 
                             userMessage.toLowerCase().includes("create brief") ||
                             userMessage.toLowerCase().includes("ready")
  
  const hasEngagement = messageCount >= 3
  const hasReasonableProgress = progress >= 40
  
  return hasMinimumData && (userWantsGeneration || (hasEngagement && hasReasonableProgress))
}

function calculateBasicProgress(data: any): number {
  if (!data) return 0
  
  let filledFields = 0
  const totalFields = 8
  
  Object.values(data).forEach(value => {
    if (value && value !== "NOT YET ANSWERED" && value !== "none") {
      filledFields++
    }
  })
  
  return Math.round((filledFields / totalFields) * 100)
}

// Cleanup old conversation memory (call this periodically)
export function cleanupConversationMemory() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  
  for (const [key, data] of conversationMemory.entries()) {
    const lastActivity = data.conversationFlow?.slice(-1)[0]?.timestamp
    if (lastActivity && new Date(lastActivity).getTime() < oneHourAgo) {
      conversationMemory.delete(key)
    }
  }
}