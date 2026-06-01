import { NextRequest, NextResponse } from "next/server"
import { buildReferralMap, ReferralMapInput } from "@/lib/referral-map"

// Referral Map endpoint. Given a target practice's specialty + location, returns
// the named independent practices nearby that could send it patients (inbound)
// and that it should send patients to (outbound), plus the single "gap" partner
// it most likely is not connected to yet. This powers the value-first Referral
// Map deliverable (see GTM/referral-map-offer.md) and the SDR worklist drafts.
//
// Unlike /api/network/discover, this does not require a logged-in provider
// profile — it maps any practice by description, so it can be run for cold leads.

export const maxDuration = 60

function inputFromParams(p: URLSearchParams): ReferralMapInput | null {
  const specialty = p.get("specialty")
  if (!specialty) return null
  return {
    specialty,
    practiceName: p.get("practiceName") || p.get("name") || undefined,
    address: p.get("address") || undefined,
    city: p.get("city") || undefined,
    state: p.get("state") || undefined,
    postal: p.get("postal") || p.get("zip") || undefined,
  }
}

export async function GET(request: NextRequest) {
  const input = inputFromParams(new URL(request.url).searchParams)
  if (!input) {
    return NextResponse.json({ error: "Missing required 'specialty' parameter" }, { status: 400 })
  }
  try {
    const map = await buildReferralMap(input)
    return NextResponse.json(map)
  } catch (error) {
    console.error("Referral map error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: ReferralMapInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  if (!body?.specialty) {
    return NextResponse.json({ error: "Missing required 'specialty' field" }, { status: 400 })
  }
  try {
    const map = await buildReferralMap(body)
    return NextResponse.json(map)
  } catch (error) {
    console.error("Referral map error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
