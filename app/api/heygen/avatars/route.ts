import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.HEYGEN_API_KEY!
      }
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('HeyGen avatars error:', error)
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Failed to fetch avatars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch avatars' },
      { status: 500 }
    )
  }
}