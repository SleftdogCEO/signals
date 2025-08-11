import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  console.log("=== Frontend API Route Called ===")
  console.log("BACKEND_URL:", BACKEND_URL)
  
  try {
    const data = await request.json()
    console.log("Form data received:", data)

    // Add validation
    if (!data.businessName || !data.websiteUrl || !data.industry || !data.location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log(`Calling backend: ${BACKEND_URL}/api/generate`)

    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    console.log("Backend response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error response:", errorText)
      
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(errorJson, { status: response.status })
      } catch {
        return NextResponse.json(
          { error: `Backend error: ${response.status} - ${errorText}` },
          { status: response.status }
        )
      }
    }

    const result = await response.json()
    console.log("Backend success response:", result)
    return NextResponse.json(result)

  } catch (error) {
    console.error("Frontend API Route Error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
