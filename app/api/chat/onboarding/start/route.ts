import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    const welcomeMessage = `Hi! I'm Sleft AI, your business strategy consultant. 

I'm here to help with:
🎯 Business strategy and growth advice  
🤝 Partnership and networking strategies
📈 Marketing and competitive insights
📋 Custom strategy briefs for your business

What would you like to discuss today?`

    return NextResponse.json({
      success: true,
      message: welcomeMessage,
      data_collected: {},
      conversation_insights: "Welcome conversation started",
      can_generate_brief: false,
      progress_percentage: 0,
      brief_generation_trigger: false
    })

  } catch (error: any) {
    console.error('Start conversation error:', error)
    
    return NextResponse.json({
      success: true,
      message: "Hi! I'm Sleft AI, your business consultant. How can I help you grow your business today?",
      data_collected: {},
      conversation_insights: "Fallback welcome",
      can_generate_brief: false,
      progress_percentage: 0,
      brief_generation_trigger: false
    })
  }
}