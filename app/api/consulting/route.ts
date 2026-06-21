import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, practiceName, projectType, budget, description } = body

  if (!name || !email || !projectType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Lead-capture sentinel policy: notify grant@sleftpayments.com FIRST, on every
  // capture, independent of Airtable. A captured lead must never be lost just
  // because the secondary store is misconfigured or down.
  try {
    await fetch("https://www.sleftpayments.com/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || "",
        businessName: practiceName || "Sleft Signals Consulting",
        source: "sleftsignals.com",
        conversationSummary: `Project Type: ${projectType}\nBudget: ${budget || "N/A"}\nDescription: ${description}`,
      }),
    })
  } catch (emailErr) {
    console.error("Consulting lead notification failed:", emailErr)
  }

  // Best-effort durable record in Airtable. Skip (don't fail the request) when
  // unconfigured, mirroring the snapshot route's degrade-gracefully pattern.
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

  if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
    try {
      const airtableRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Consulting%20Requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  Name: name,
                  Email: email,
                  Phone: phone || "",
                  "Practice Name": practiceName || "",
                  "Project Type": projectType,
                  Budget: budget || "",
                  Description: description,
                  "Created At": new Date().toISOString(),
                },
              },
            ],
          }),
        }
      )

      if (!airtableRes.ok) {
        console.error("Airtable error:", await airtableRes.text())
      }
    } catch (airtableErr) {
      console.error("Airtable write failed:", airtableErr)
    }
  } else {
    console.error("Airtable not configured, skipping consulting lead storage")
  }

  return NextResponse.json({ success: true })
}
