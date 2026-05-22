import { NextRequest, NextResponse } from "next/server"
import { sendIntroRequestNotification } from "@/lib/email"

// Email-only notification for an introduction request. The matches row is
// written client-side via the authenticated Supabase client (RLS-gated), so
// this route just alerts Grant so he can broker the intro.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requesterName,
      requesterEmail,
      requesterSpecialty,
      requesterLocation,
      targetName,
      targetSpecialty,
      targetLocation,
    } = body || {}

    if (!requesterEmail || !targetName) {
      return NextResponse.json(
        { error: "Missing requester or target details" },
        { status: 400 }
      )
    }

    await sendIntroRequestNotification({
      requesterName: requesterName || "",
      requesterEmail,
      requesterSpecialty: requesterSpecialty || "",
      requesterLocation: requesterLocation || "",
      targetName,
      targetSpecialty: targetSpecialty || "",
      targetLocation: targetLocation || "",
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("request-intro route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
