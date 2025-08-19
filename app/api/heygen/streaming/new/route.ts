import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch('https://api.heygen.com/v1/streaming.new', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': process.env.HEYGEN_API_KEY!
      },
      body: JSON.stringify({
        quality: 'medium',
        voice: { rate: 1 },
        video_encoding: 'VP8',
        disable_idle_timeout: false,
        version: 'v2',
        stt_settings: {
          provider: 'deepgram',
          confidence: 0.55
        },
        activity_idle_timeout: 120
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Streaming new session error:', error)
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Failed to create streaming session:', error)
    return NextResponse.json(
      { error: 'Failed to create streaming session' },
      { status: 500 }
    )
  }
}