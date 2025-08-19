import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json()

    console.log('Processing message for session:', sessionId)

    // Get OpenAI response first
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful business strategy assistant for Sleft Signals. Keep responses concise and conversational, under 80 words. Speak naturally as if you're having a face-to-face conversation."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 120,
      temperature: 0.7
    })

    const aiResponse = completion.choices[0].message.content

    console.log('OpenAI response:', aiResponse)

    // Send the AI response to HeyGen avatar to speak
    const heygenResponse = await fetch('https://api.heygen.com/v1/streaming.task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.HEYGEN_API_KEY!
      },
      body: JSON.stringify({
        session_id: sessionId,
        text: aiResponse,
        task_type: 'talk',
        task_mode: 'sync'
      })
    })

    if (!heygenResponse.ok) {
      const error = await heygenResponse.json()
      console.error('HeyGen task error:', error)
      return NextResponse.json({ 
        error: 'Failed to send message to avatar',
        details: error 
      }, { status: heygenResponse.status })
    }

    const heygenData = await heygenResponse.json()
    console.log('HeyGen task created:', heygenData)
    
    // Only return success status - NO AI response text
    return NextResponse.json({ 
      success: true,
      taskId: heygenData.data?.task_id
    })

  } catch (error) {
    console.error('HeyGen chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get avatar response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}