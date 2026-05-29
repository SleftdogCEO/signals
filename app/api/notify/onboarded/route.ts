import { NextRequest, NextResponse } from "next/server"
import { sendProviderOnboardedNotification } from "@/lib/email"

// Server-side relay so the onboarding client can notify Grant that a provider
// completed their profile, without a browser cross-origin call to the
// sleftpayments lead-capture API. This is the qualified-lead signal.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body?.email) {
      return NextResponse.json({ success: false, error: "email required" }, { status: 400 })
    }

    await sendProviderOnboardedNotification({
      email: body.email,
      practiceName: body.practiceName || "",
      specialty: body.specialty || "",
      location: body.location || "",
      patientsIWant: Array.isArray(body.patientsIWant) ? body.patientsIWant : [],
      patientsIRefer: Array.isArray(body.patientsIRefer) ? body.patientsIRefer : [],
      serviceTags: Array.isArray(body.serviceTags) ? body.serviceTags : [],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("notify/onboarded error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
