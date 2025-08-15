import { NextRequest, NextResponse } from "next/server"

// Environment-aware backend URL
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sleft-signal.onrender.com'
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
}

const BACKEND_URL = getBackendUrl()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // Make params a Promise
) {
  try {
    const { userId } = await params 
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    
    console.log(`Frontend API: Fetching briefs for user ${userId}`)
    
    const response = await fetch(
      `${BACKEND_URL}/api/user-briefs/${userId}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    console.log(`Frontend API: User briefs response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Frontend API: Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch user briefs" },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`Frontend API: Found ${result.briefs?.length || 0} briefs`)
    return NextResponse.json(result)

  } catch (error) {
    console.error("Frontend API Route Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}