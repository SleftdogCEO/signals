import { NextResponse } from 'next/server'

export async function POST() {
  try {
    if (!process.env.HEYGEN_API_KEY) {
      console.error('Missing HEYGEN_API_KEY environment variable')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.HEYGEN_API_KEY, // ✅ Use 'x-api-key' instead of 'X-Api-Key'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HeyGen API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `HeyGen API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (!data?.data?.token) {
      console.error('Invalid response from HeyGen:', data)
      return NextResponse.json(
        { error: 'Invalid token response from HeyGen' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      token: data.data.token 
    })

  } catch (error) {
    console.error('Token creation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}