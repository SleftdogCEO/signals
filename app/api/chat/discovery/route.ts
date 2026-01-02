import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { OutreachStrategy } from '@/types/strategy'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// In-memory conversation store (use Redis in production)
const conversations = new Map<string, {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  extractedData: Partial<OutreachStrategy>
}>()

const SYSTEM_PROMPT = `You are Sleft's AI assistant helping users find REFERRAL PARTNERS - other businesses that can send them customers.

CRITICAL DISTINCTION - UNDERSTAND THIS:
- REFERRAL PARTNERS = Other businesses that serve the same customers BEFORE or AFTER you do. They REFER customers to you.
- CUSTOMERS = People/businesses who BUY your product/service directly.

WE FIND REFERRAL PARTNERS, NOT CUSTOMERS.

EXAMPLE - Payment Processing Company:
❌ WRONG (these are CUSTOMERS): retail stores, restaurants, e-commerce businesses
✅ RIGHT (these are REFERRAL PARTNERS): accountants, bookkeepers, business consultants, banks, commercial lenders, business attorneys, POS system vendors

EXAMPLE - HVAC Company:
❌ WRONG (these are CUSTOMERS): homeowners, property owners
✅ RIGHT (these are REFERRAL PARTNERS): realtors, property managers, home inspectors, general contractors

YOUR CORE BELIEF: One good referral partner beats 100 cold leads. A realtor who refers you to every home buyer is worth more than 100 random leads.

CONVERSATION FLOW:
1. Get their business name and what they do
2. Get their location
3. PROACTIVELY SUGGEST 3-5 referral partner types based on their industry
4. Ask if those suggestions sound right, or if they'd add/remove any
5. Once confirmed, summarize the plan

REFERRAL PARTNER SUGGESTIONS BY INDUSTRY:
- Payment Processing/Merchant Services: accountants, bookkeepers, business consultants, banks, commercial lenders, business attorneys, POS vendors, business coaches
- HVAC: realtors, property managers, home inspectors, general contractors, insurance adjusters
- Plumber: realtors, property managers, home inspectors, kitchen/bath remodelers, insurance adjusters
- Electrician: general contractors, solar installers, home inspectors, property managers, EV dealerships
- Landscaper: realtors, property managers, pool companies, outdoor living contractors, HOA managers
- Restaurant: hotels, event venues, wedding planners, corporate event planners, tourism boards
- Gym/Fitness: physical therapists, chiropractors, nutritionists, corporate HR departments, doctors
- Salon/Spa: wedding planners, photographers, boutiques, hotels, event venues
- Accountant: lawyers, financial advisors, real estate agents, business consultants, banks
- Lawyer: accountants, real estate agents, financial advisors, insurance agents, banks
- Insurance Agent: realtors, mortgage brokers, car dealerships, financial advisors, HR departments
- Real Estate Agent: mortgage brokers, home inspectors, insurance agents, attorneys, moving companies
- Mortgage Broker: realtors, financial advisors, accountants, divorce attorneys, estate attorneys
- Web Design/Marketing Agency: accountants, business consultants, commercial printers, business coaches
- Photographer: wedding planners, event venues, florists, caterers, bridal shops
- Caterer: event venues, wedding planners, corporate event planners, florists, photographers

HOW TO RESPOND:
- Keep responses SHORT (2-4 sentences max)
- Once you know their industry, IMMEDIATELY suggest partner types
- Ask "Do those sound right? Anyone you'd add or remove?"
- Don't wait for them to think of partners - be proactive

WHEN READY, FORMAT LIKE:
"Perfect. Here's what I'll search for in [location]:

🎯 PARTNERS
• [Partner type 1] - [one-line reason]
• [Partner type 2] - [one-line reason]
• [Partner type 3] - [one-line reason]

📅 EVENTS
• [Industry] networking events
• Business mixers

Look good?"

RULES:
- NEVER suggest their customers as partners
- ALWAYS suggest businesses that could REFER customers to them
- Be direct, not salesy
- Keep it simple`

const EXTRACTION_PROMPT = `Based on the conversation so far, extract the following information in JSON format.

IMPORTANT: "targetLeads" should be REFERRAL PARTNERS (businesses that can send them customers), NOT their direct customers.
Example for Payment Processing: accountants, bookkeepers, business consultants - NOT retail stores or restaurants (those are customers).

{
  "business": {
    "name": "business name (use industry if no specific name given, e.g. 'My Gym' or 'Payment Processing Company')",
    "industry": "their industry/what they do",
    "location": "city, state"
  },
  "goal": "partnerships",
  "targetLeads": [
    { "type": "Referral partner type (NOT customers)", "reason": "How they can refer customers" }
  ],
  "targetEvents": [
    { "type": "Event type", "reason": "Why relevant" }
  ],
  "targetIntel": [
    { "topic": "Intel topic", "reason": "Why useful" }
  ],
  "isComplete": true or false
}

SET "isComplete" to TRUE when ALL of these are true:
1. We know their industry/business type
2. We know their location
3. We have at least 2-3 referral partner types listed
4. The user has confirmed/agreed (said "ok", "yes", "looks good", "perfect", "that works", etc.)

Return ONLY valid JSON, no other text.`

export async function POST(req: Request) {
  try {
    const { userId, message, reset } = await req.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 })
    }

    // Reset conversation if requested
    if (reset) {
      conversations.delete(userId)
    }

    // Get or create conversation
    let conversation = conversations.get(userId)
    if (!conversation) {
      conversation = {
        messages: [{ role: "system", content: SYSTEM_PROMPT }],
        extractedData: {}
      }

      // Add initial greeting
      const greeting = "Hey! Sleft helps you find local businesses worth connecting with - the kind that can send you customers, not just one-off leads. What's your business?"
      conversation.messages.push({ role: "assistant", content: greeting })
      conversations.set(userId, conversation)

      // Return initial greeting if no message provided
      if (!message) {
        return NextResponse.json({
          success: true,
          message: greeting,
          extractedData: {},
          isReadyForStrategy: false,
          proposedStrategy: null
        })
      }
    }

    // Add user message
    conversation.messages.push({ role: "user", content: message })

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation.messages as any,
      max_tokens: 500,
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0].message.content || "Tell me more about your business."
    conversation.messages.push({ role: "assistant", content: assistantMessage })

    // Extract structured data from conversation
    const extractionMessages = [
      { role: "system" as const, content: EXTRACTION_PROMPT },
      { role: "user" as const, content: `Conversation so far:\n${conversation.messages
        .filter(m => m.role !== "system")
        .map(m => `${m.role}: ${m.content}`)
        .join('\n')}` }
    ]

    const extractionCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: extractionMessages,
      max_tokens: 1000,
      temperature: 0,
    })

    let extractedData: Partial<OutreachStrategy> & { isComplete?: boolean } = {}
    let isReadyForStrategy = false

    try {
      const jsonStr = extractionCompletion.choices[0].message.content || '{}'
      // Clean potential markdown code blocks
      const cleanJson = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanJson)

      extractedData = {
        business: parsed.business,
        goal: parsed.goal,
        targetLeads: parsed.targetLeads || [],
        targetEvents: parsed.targetEvents || [],
        targetIntel: parsed.targetIntel || []
      }
      isReadyForStrategy = parsed.isComplete === true
      conversation.extractedData = extractedData
    } catch (e) {
      console.error('Failed to parse extraction:', e)
    }

    // Build proposed strategy if ready
    let proposedStrategy: OutreachStrategy | null = null
    // Check if we have enough data - business name can fallback to industry
    const hasBusinessInfo = extractedData.business?.name || extractedData.business?.industry
    const hasLocation = extractedData.business?.location
    const hasPartners = (extractedData.targetLeads?.length || 0) >= 2

    if (isReadyForStrategy && hasBusinessInfo && hasLocation && hasPartners) {
      proposedStrategy = {
        business: {
          name: extractedData.business?.name || `My ${extractedData.business?.industry || 'Business'}`,
          industry: extractedData.business?.industry || 'General',
          location: extractedData.business.location
        },
        goal: extractedData.goal || 'partnerships',
        targetLeads: extractedData.targetLeads || [],
        targetEvents: extractedData.targetEvents || [],
        targetIntel: extractedData.targetIntel || []
      }
    }

    // Save conversation
    conversations.set(userId, conversation)

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      extractedData,
      isReadyForStrategy,
      proposedStrategy
    })

  } catch (error: any) {
    console.error('Discovery chat error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Chat failed',
      message: "Sorry, I hit a snag. What's your business?",
      extractedData: {},
      isReadyForStrategy: false,
      proposedStrategy: null
    }, { status: 500 })
  }
}

// Clean up old conversations periodically
export async function DELETE(req: Request) {
  const { userId } = await req.json()
  if (userId) {
    conversations.delete(userId)
  }
  return NextResponse.json({ success: true })
}
