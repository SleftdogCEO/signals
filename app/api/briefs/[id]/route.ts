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
  { params }: { params: { id: string } }
) {
  try {
    const briefId = params.id
    console.log(`Frontend API: Fetching brief ${briefId} from ${BACKEND_URL}`)
    
    if (!briefId || briefId === 'null' || briefId === 'undefined') {
      console.error(`Frontend API: Invalid brief ID: ${briefId}`)
      return NextResponse.json(
        { error: "Invalid brief ID" },
        { status: 400 }
      )
    }
    
    const response = await fetch(`${BACKEND_URL}/api/briefs/${briefId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout for production
      signal: AbortSignal.timeout(30000), // 30 seconds
    })

    console.log(`Frontend API: Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Frontend API: Backend error:", errorText)
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Brief not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to fetch brief", details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log("Frontend API: Brief fetched successfully")
    return NextResponse.json(result)

  } catch (error) {
    console.error("Frontend API Route Error:", error)
    
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: "Request timeout - please try again" },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const briefId = params.id
    
    console.log(`Frontend API: Deleting brief ${briefId}`)
    
    const response = await fetch(`${BACKEND_URL}/api/briefs/${briefId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log(`Frontend API: Delete response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Frontend API: Delete error:", errorText)
      return NextResponse.json(
        { error: "Failed to delete brief", details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log("Frontend API: Brief deleted successfully")
    return NextResponse.json(result)

  } catch (error) {
    console.error("Frontend API Delete Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}