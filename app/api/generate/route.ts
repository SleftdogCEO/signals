import { NextRequest, NextResponse } from "next/server"

// Environment-aware backend URL
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sleft-signal.onrender.com'
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
}

const BACKEND_URL = getBackendUrl()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Frontend API: Received request body:", {
      businessName: body.businessName,
      userId: body.userId,
      hasUserId: !!body.userId
    })

    // VALIDATE USER ID ON FRONTEND
    if (!body.userId || body.userId === 'undefined' || body.userId === 'null') {
      console.error("Frontend API: Missing or invalid userId:", body.userId)
      return NextResponse.json(
        { 
          error: "User authentication required",
          details: "Please log in and try again"
        },
        { status: 401 }
      )
    }

    const backendBody = {
      ...body,
      userId: body.userId // Ensure userId is passed
    }

    console.log("Frontend API: Sending to backend URL:", BACKEND_URL)
    console.log("Frontend API: Request payload:", {
      ...backendBody,
      userId: backendBody.userId,
      environment: process.env.NODE_ENV
    })

    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendBody),
    })

    console.log(`Frontend API: Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Frontend API: Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to generate brief", details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log("Frontend API: Success response:", {
      success: result.success,
      briefId: result.briefId,
      hasUserId: !!result.brief?.formData?.userId
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error("Frontend API Route Error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
