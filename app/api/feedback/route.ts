import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendFeedbackNotification } from "@/lib/email"

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

    // Sentinel policy: notify grant@ on every feedback capture, independent of
    // the DB write, so the signal is never lost even if persistence fails.
    await sendFeedbackNotification({ briefId, userId, businessName, likes, dislikes })

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
      // grant@ was already notified above, so the feedback is captured even if
      // the row didn't persist. Log loudly for follow-up.
      console.error("Supabase error storing feedback:", error)
      return NextResponse.json({ success: true, message: "Feedback recorded" })
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
