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
      missing_info_strategy: { type: ["string", "null"] },
      conversation_type: { type: "string" } // NEW: Track conversation type
    },
    required: ["message", "data_collected", "conversation_insights", "can_generate_brief", "progress_percentage", "brief_generation_trigger", "conversation_type"]
  },
  strict: true
}

export async function POST(req: Request) {
  try {
    const { userId, userMessage, conversationData, messageHistory } = await req.json()

    // Get or create conversation memory
    const memoryKey = `${userId}_conversation`
    let conversationMemoryData = conversationMemory.get(memoryKey) || {
      totalMessages: 0,
      keyInsights: [],
      userPersonality: "unknown",
      informationGaps: [],
      conversationFlow: [],
      briefRequestCount: 0, // Track how many times user asked for brief
      userConsent: null     // Track user consent for brief generation
    }

    // Enhanced system prompt for natural conversations
    const systemPrompt = `You are "Sleft AI" - an elite business strategist and conversational AI assistant.

🎯 YOUR CORE ABILITIES:
1. ANSWER ANY QUESTION: Business strategy, marketing, partnerships, industry insights, general advice
2. NATURAL CONVERSATION: Be helpful, engaging, and knowledgeable on all topics
3. BUSINESS INTELLIGENCE: Gradually collect business information through natural conversation
4. STRATEGIC BRIEF GENERATION: Only when user explicitly wants one AND gives consent

📊 CURRENT USER DATA: ${JSON.stringify(conversationData, null, 2)}
🧠 CONVERSATION MEMORY: ${JSON.stringify(conversationMemoryData, null, 2)}

🎨 CONVERSATION INTELLIGENCE RULES:

A) GENERAL QUESTIONS (Business advice, how-to, industry insights):
   - Answer naturally and helpfully
   - Provide valuable insights and actionable advice
   - conversation_type: "general_advice"
   - Don't force data collection
   - Be the expert consultant they need

B) BUSINESS-RELATED QUESTIONS (About their company):
   - Answer the question first, then naturally gather relevant info
   - conversation_type: "business_discovery"
   - Extract info organically, don't interrogate
   - Build relationship before data collection

C) BRIEF GENERATION REQUESTS:
   - Only generate when user explicitly asks AND confirms
   - conversation_type: "brief_request"
   - Always ask for consent: "Would you like me to create a comprehensive strategy brief based on our conversation?"
   - Explain what the brief includes before generating
   - NEVER auto-generate without explicit user consent

🤖 DATA COLLECTION STRATEGY (Only during relevant conversations):
- ESSENTIAL (for brief): business_name, industry, location, custom_goal
- VALUABLE: website_url, partnership_goals, growth_objectives, networking_keyword
- ORGANIC: Extract from natural conversation, don't interrogate
- RESPECTFUL: If user says "no" or "don't know", respect it and provide value anyway

🎯 BRIEF GENERATION CONSENT PROTOCOL:
1. User must explicitly request brief ("create brief", "generate strategy", "I want a brief")
2. Ask for consent: "Based on our conversation, I can create a personalized strategy brief for [business]. Would you like me to proceed?"
3. Explain value: "This will include competitive analysis, partnership opportunities, and growth strategies."
4. Only set brief_generation_trigger: true AFTER user confirms "yes"

💬 RESPONSE PERSONALITY:
- Professional yet friendly business consultant
- Knowledgeable across all business domains
- Patient and helpful, never pushy
- Focused on providing immediate value
- Expert in strategy, marketing, partnerships, growth

⚠️ CRITICAL RULES:
- NEVER force brief generation
- NEVER assume user wants a brief
- ALWAYS provide value regardless of data completeness
- BE CONVERSATIONAL, not robotic
- Answer questions directly before any data collection`

    // Build conversation context with memory
    const messages = [
      { role: "system", content: systemPrompt },
      ...messageHistory.slice(-10), // More context for better conversations
      { role: "user", content: userMessage }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_schema", json_schema: responseSchema },
      temperature: 0.8, // Higher creativity for better conversations
      max_tokens: 1500,
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')

    // Update conversation memory intelligently
    conversationMemoryData.totalMessages += 1
    conversationMemoryData.conversationFlow.push({
      userMessage,
      aiResponse: response.message,
      timestamp: new Date().toISOString(),
      conversationType: response.conversation_type,
      dataCollected: Object.keys(response.data_collected).filter(key => 
        response.data_collected[key] && 
        response.data_collected[key] !== "NOT YET ANSWERED" && 
        response.data_collected[key] !== "none"
      )
    })

    // Track brief requests
    if (response.conversation_type === "brief_request") {
      conversationMemoryData.briefRequestCount += 1
    }

    // Handle user consent for brief generation
    if (userMessage.toLowerCase().includes("yes") && 
        conversationMemoryData.conversationFlow.slice(-2)[0]?.conversationType === "brief_request") {
      conversationMemoryData.userConsent = "granted"
      response.brief_generation_trigger = true
    }

    conversationMemory.set(memoryKey, conversationMemoryData)

    // Intelligent progress calculation (only for business conversations)
    let enhancedProgress = 0
    if (response.conversation_type === "business_discovery" || response.conversation_type === "brief_request") {
      enhancedProgress = calculateIntelligentProgress(response.data_collected, conversationMemoryData)
    } else {
      // For general conversations, calculate based on existing data only
      enhancedProgress = calculateIntelligentProgress(conversationData, conversationMemoryData)
    }
    response.progress_percentage = enhancedProgress

    // Intelligent brief generation check (ONLY with user consent)
    const canGenerate = checkIntelligentBriefGeneration(
      response.data_collected || conversationData, 
      conversationMemoryData, 
      enhancedProgress,
      userMessage
    )
    response.can_generate_brief = canGenerate

    // Override brief trigger - ONLY with explicit consent
    if (conversationMemoryData.userConsent !== "granted") {
      response.brief_generation_trigger = false
    }

    return NextResponse.json({
      success: true,
      ...response,
      conversationMemoryId: memoryKey
    })

  } catch (error: any) {
    console.error('Onboarding continue error:', error)
    
    // FIXED: Proper fallback response for errors
    return NextResponse.json({
      success: true,
      message: "I apologize for the technical hiccup! Let me help you with your question. What would you like to know about business strategy, partnerships, or growth? I'm here to provide valuable insights and assistance.",
      data_collected: {},
      conversation_insights: "Technical error occurred - maintaining helpful conversation flow",
      can_generate_brief: false,
      progress_percentage: calculateBasicProgress({}),
      brief_generation_trigger: false,
      missing_info_strategy: null,
      conversation_type: "error_recovery"
    })
  }
}

function calculateIntelligentProgress(data: any, memory: any): number {
  if (!data) return 0
  
  let score = 0
  
  // Essential fields (60 points total)
  if (data.business_name && data.business_name !== "NOT YET ANSWERED") score += 20
  if (data.industry && data.industry !== "NOT YET ANSWERED") score += 15
  if (data.location && data.location !== "NOT YET ANSWERED") score += 15
  if (data.custom_goal && data.custom_goal !== "NOT YET ANSWERED") score += 10
  
  // Valuable additions (25 points total)  
  if (data.networking_keyword && data.networking_keyword !== "NOT YET ANSWERED") score += 8
  if (data.partnership_goals && data.partnership_goals !== "NOT YET ANSWERED") score += 7
  if (data.growth_objectives && data.growth_objectives !== "NOT YET ANSWERED") score += 5
  if (data.website_url && data.website_url !== "NOT YET ANSWERED" && data.website_url !== "none") score += 5
  
  // Conversation quality bonus (15 points total)
  const messageCount = memory.totalMessages || 0
  const engagementBonus = Math.min(messageCount * 2, 10) // Up to 10 points for engagement
interface ConversationFlow {
    conversationType: string;
}

interface Memory {
    conversationFlow?: ConversationFlow[];
}

const businessConversations: number = (memory as Memory).conversationFlow?.filter(flow => 
        flow.conversationType === "business_discovery"
).length || 0;
  const businessBonus = Math.min(businessConversations * 1, 5) // Up to 5 for business focus
  
  score += engagementBonus + businessBonus
  
  return Math.min(score, 100)
}

function checkIntelligentBriefGeneration(data: any, memory: any, progress: number, userMessage: string): boolean {
  // Must have some business context
  const hasBusinessIdentity = data.business_name || data.industry
  const hasLocation = data.location && data.location !== "NOT YET ANSWERED"
  
  // Basic viability check (relaxed)
  const hasMinimalData = hasBusinessIdentity && (hasLocation || progress >= 30)
  
  // User explicit request check
  const userRequestsBrief = userMessage.toLowerCase().includes("generate") || 
                           userMessage.toLowerCase().includes("create brief") ||
                           userMessage.toLowerCase().includes("strategy brief") ||
                           userMessage.toLowerCase().includes("brief") ||
                           userMessage.toLowerCase().includes("ready")
  
  // Engagement and progress check
  const hasEngagement = (memory.totalMessages || 0) >= 2
  const hasDecentProgress = progress >= 40
  
  return hasMinimalData && hasEngagement && (userRequestsBrief || hasDecentProgress)
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