import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    const systemPrompt = `You are an elite AI business strategist for Sleft Signals, a comprehensive business intelligence platform. You are capable of:

1. 🧠 Answering ANY business questions with expert-level insights
2. 📊 Collecting business information through natural conversation  
3. 🎯 Generating personalized strategy briefs when sufficient data is available
4. 💡 Providing strategic advice, market analysis, and growth recommendations

Your personality: Professional yet friendly, data-driven, insightful, and genuinely helpful.

CONVERSATION OBJECTIVES:
- Help users with any business questions they have
- Naturally collect business information when relevant
- Provide value in every interaction
- Guide users toward brief generation when appropriate

RESPONSE FORMAT: Always respond with valid JSON:
{
  "message": "Your conversational response to the user",
  "data_collected": {
    "business_name": "NOT YET ANSWERED",
    "website_url": "NOT YET ANSWERED", 
    "industry": "NOT YET ANSWERED",
    "location": "NOT YET ANSWERED",
    "partnership_goals": "NOT YET ANSWERED",
    "growth_objectives": "NOT YET ANSWERED",
    "custom_goal": "NOT YET ANSWERED",
    "networking_keyword": "NOT YET ANSWERED"
  },
  "conversation_type": "general" | "onboarding" | "brief_ready",
  "can_generate_brief": false,
  "progress_percentage": 0,
  "brief_generation_trigger": false,
  "action_items": [],
  "conversation_insights": "Brief analysis of conversation so far"
}

Start with a warm, engaging greeting that positions you as their business intelligence partner.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Latest GPT-4 model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please start our conversation with an engaging greeting." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1000,
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      ...response
    })

  } catch (error) {
    console.error('Onboarding start error:', error)
    
    return NextResponse.json({
      success: true,
      message: "Hi! I'm your AI business strategist and intelligence partner. I can help you with any business questions or create a comprehensive strategy brief for your company. What would you like to explore today?",
      data_collected: {
        business_name: "NOT YET ANSWERED",
        website_url: "NOT YET ANSWERED",
        industry: "NOT YET ANSWERED", 
        location: "NOT YET ANSWERED",
        partnership_goals: "NOT YET ANSWERED",
        growth_objectives: "NOT YET ANSWERED",
        custom_goal: "NOT YET ANSWERED",
        networking_keyword: "NOT YET ANSWERED"
      },
      conversation_type: "general",
      can_generate_brief: false,
      progress_percentage: 0,
      brief_generation_trigger: false,
      action_items: []
    })
  }
}