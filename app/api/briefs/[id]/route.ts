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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params
    const briefId = await Promise.resolve(params.id)
    
    if (!briefId || briefId === 'null' || briefId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid brief ID' },
        { status: 400 }
      )
    }

    console.log(`Frontend API: Fetching brief ${briefId} from ${process.env.BACKEND_URL}`)

    const response = await fetch(`${process.env.BACKEND_URL}/api/briefs/${briefId}`)
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching brief:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brief' },
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