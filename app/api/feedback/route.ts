import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { briefId, userId, businessName, likes, dislikes, timestamp } = body

    // Validate required fields
    if (!likes || !dislikes) {
      return NextResponse.json(
        { success: false, error: "Both likes and dislikes are required" },
        { status: 400 }
      )
    }

    // Store feedback in Supabase
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        brief_id: briefId || null,
        user_id: userId || null,
        business_name: businessName || null,
        likes: likes,
        dislikes: dislikes,
        created_at: timestamp || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error storing feedback:", error)
      // If the table doesn't exist, log but don't fail
      // The feedback is valuable - we can still log it
      console.log("Feedback received (table may not exist):", {
        briefId,
        businessName,
        likes,
        dislikes,
        timestamp
      })
      return NextResponse.json({ success: true, message: "Feedback logged" })
    }

    return NextResponse.json({ success: true, feedbackId: data?.id })
  } catch (error) {
    console.error("Error processing feedback:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process feedback" },
      { status: 500 }
    )
  }
}
