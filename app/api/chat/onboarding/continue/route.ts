import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Simple conversation memory store
const conversationMemory = new Map()

// FIXED: Enhanced schema that distinguishes business data collection
const responseSchema = {
  name: "BusinessChatResponse",
  schema: {
    type: "object",
    properties: {
      message: { type: "string" },
      business_name: { type: "string" },
      website_url: { type: "string" },
      industry: { type: "string" },
      location: { type: "string" },
      partnership_goals: { type: "string" },
      growth_objectives: { type: "string" },
      custom_goal: { type: "string" },
      networking_keyword: { type: "string" },
      progress_percentage: { type: "number" },
      can_generate_brief: { type: "boolean" },
      brief_generation_trigger: { type: "boolean" },
      conversation_type: { type: "string" },
      is_business_data_collection: { type: "boolean" } // NEW: Flag for actual business data collection
    },
    required: ["message", "business_name", "website_url", "industry", "location", "partnership_goals", "growth_objectives", "custom_goal", "networking_keyword", "progress_percentage", "can_generate_brief", "brief_generation_trigger", "conversation_type", "is_business_data_collection"],
    additionalProperties: false
  },
  strict: true
}

export async function POST(req: Request) {
  try {
    const { userId, userMessage, conversationData = {}, messageHistory = [] } = await req.json()

    // Get conversation memory
    const memoryKey = `${userId}_conversation`
    let memory = conversationMemory.get(memoryKey) || {
      messages: [],
      businessInfo: {},
      userConsent: false,
      totalMessages: 0,
      businessDataCollectionStarted: false // NEW: Track if business data collection has started
    }

    // Add current message to memory
    memory.messages.push({ role: "user", content: userMessage, timestamp: new Date() })
    memory.totalMessages += 1

    // Enhanced system prompt with clear business data collection rules
    const systemPrompt = `You are Sleft AI, a friendly business consultant who helps with strategy and growth.

CONVERSATION MEMORY: ${JSON.stringify(memory.businessInfo, null, 2)}
TOTAL MESSAGES: ${memory.totalMessages}
BUSINESS DATA COLLECTION STARTED: ${memory.businessDataCollectionStarted}
USER CONSENT FOR BRIEF: ${memory.userConsent}

CRITICAL RULES FOR BUSINESS DATA COLLECTION:

1. GENERAL QUESTIONS (No business data collection):
   - Questions about locations: "Where is Miami?" - Answer naturally, don't collect as business location
   - How-to questions: "How do I improve marketing?" - Provide advice, no data collection
   - General business advice - Help them, no data collection needed
   - Set is_business_data_collection: false
   - Keep ALL business fields as "NOT_PROVIDED"

2. BUSINESS DISCOVERY MODE (Only after explicit business discussion):
   - ONLY collect data when user talks about THEIR business
   - Examples: "I run a restaurant in Miami", "My company is ABC Corp"
   - Set is_business_data_collection: true ONLY when user provides their business info
   - Ask follow-up questions to learn more about THEIR business

3. BUSINESS DATA COLLECTION SEQUENCE:
   - Step 1: Ask "What's your business name?" - ONLY then start collecting
   - Step 2: Ask about their industry
   - Step 3: Ask about their location  
   - Step 4: Ask about their goals
   - Progress should ONLY increase when these are answered

RESPONSE FIELDS (use these exact values):
- message: Your conversational response
- business_name: Extract ONLY if they mention THEIR business name, else "NOT_PROVIDED"
- website_url: Extract ONLY if they mention THEIR website, else "NOT_PROVIDED"
- industry: Extract ONLY if they mention THEIR business industry, else "NOT_PROVIDED"
- location: Extract ONLY if they mention THEIR business location, else "NOT_PROVIDED"
- partnership_goals: Extract ONLY if they mention THEIR partnership needs, else "NOT_PROVIDED"
- growth_objectives: Extract ONLY if they mention THEIR business goals, else "NOT_PROVIDED"
- custom_goal: Extract ONLY if they mention THEIR specific objectives, else "NOT_PROVIDED"
- networking_keyword: Extract ONLY if they mention THEIR networking focus, else "NOT_PROVIDED"
- progress_percentage: Calculate based ONLY on actual business info collected
- can_generate_brief: true only if sufficient THEIR business data collected
- brief_generation_trigger: true only if user explicitly asks for brief
- conversation_type: "general_help" | "business_discovery" | "brief_request"
- is_business_data_collection: true ONLY when actually collecting their business data

EXAMPLES:

User: "Where is Miami located?"
→ conversation_type: "general_help"
→ is_business_data_collection: false
→ ALL business fields: "NOT_PROVIDED"
→ Answer: "Miami is located in southeastern Florida..."

User: "I run a restaurant in Miami"
→ conversation_type: "business_discovery"  
→ is_business_data_collection: true
→ industry: "Restaurant"
→ location: "Miami"
→ Answer: "That's great! Tell me more about your restaurant..."

User: "What's your business name?" (AI asking)
→ This is when business data collection should start

IMPORTANT: Don't assume general questions are about their business!`

    const messages = [
      { role: "system", content: systemPrompt },
      ...memory.messages.slice(-6), // Include recent conversation memory
      { role: "user", content: userMessage }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_schema", json_schema: responseSchema },
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')

    // CRITICAL: Only update business info when actually collecting business data
    if (response.is_business_data_collection) {
      memory.businessDataCollectionStarted = true
      
      // Update memory with new business info ONLY for actual business data
      const businessFields = ['business_name', 'website_url', 'industry', 'location', 'partnership_goals', 'growth_objectives', 'custom_goal', 'networking_keyword']
      businessFields.forEach(field => {
        if (response[field] && response[field] !== "NOT_PROVIDED") {
          memory.businessInfo[field] = response[field]
          console.log(`✅ Collected business data: ${field} = ${response[field]}`)
        }
      })
    } else {
      console.log(`💭 General conversation - no business data collected`)
    }

    // Handle brief generation consent
    if (response.conversation_type === "brief_request" && 
        userMessage.toLowerCase().includes("yes")) {
      memory.userConsent = true
      response.brief_generation_trigger = true
    }

    // Add AI response to memory
    memory.messages.push({ role: "assistant", content: response.message, timestamp: new Date() })

    // Save memory
    conversationMemory.set(memoryKey, memory)

    // FIXED: Only merge actual business data (not general answers)
    const mergedData = memory.businessDataCollectionStarted ? {
      business_name: memory.businessInfo.business_name || null,
      website_url: memory.businessInfo.website_url || null,
      industry: memory.businessInfo.industry || null,
      location: memory.businessInfo.location || null,
      partnership_goals: memory.businessInfo.partnership_goals || null,
      growth_objectives: memory.businessInfo.growth_objectives || null,
      custom_goal: memory.businessInfo.custom_goal || null,
      networking_keyword: memory.businessInfo.networking_keyword || null
    } : {} // Empty if no business data collected yet

    // FIXED: Calculate progress ONLY from actual business data
    const actualProgress = memory.businessDataCollectionStarted ? 
      calculateProgress(mergedData) : 0

    return NextResponse.json({
      success: true,
      message: response.message,
      data_collected: mergedData,
      conversation_insights: `Message ${memory.totalMessages}: ${response.conversation_type} ${response.is_business_data_collection ? '(Business Data)' : '(General)'}`,
      can_generate_brief: response.can_generate_brief && memory.businessDataCollectionStarted,
      progress_percentage: actualProgress,
      brief_generation_trigger: response.brief_generation_trigger && memory.userConsent,
      is_business_data_collection: response.is_business_data_collection
    })

  } catch (error: any) {
    console.error('Chat error:', error)
    
    // Simple fallback without complex schema
    return NextResponse.json({
      success: true,
      message: "I'm here to help with any business questions you have! What would you like to discuss about strategy, marketing, partnerships, or growth?",
      data_collected: {},
      conversation_insights: "Error recovery mode",
      can_generate_brief: false,
      progress_percentage: 0,
      brief_generation_trigger: false,
      is_business_data_collection: false
    })
  }
}

function calculateProgress(data: any): number {
  if (!data || Object.keys(data).length === 0) return 0
  
  const essentialFields = ['business_name', 'industry', 'location', 'custom_goal']
  const filledFields = essentialFields.filter(field => 
    data[field] && data[field] !== "NOT_PROVIDED" && data[field] !== null
  ).length
  
  return Math.round((filledFields / essentialFields.length) * 100)
}

export function cleanupConversationMemory() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  
  for (const [key, data] of conversationMemory.entries()) {
    const lastMessage = data.messages?.slice(-1)[0]?.timestamp
    if (lastMessage && new Date(lastMessage).getTime() < oneHourAgo) {
      conversationMemory.delete(key)
    }
  }
}