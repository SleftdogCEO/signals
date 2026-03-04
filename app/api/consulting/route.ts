import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, practiceName, projectType, budget, description } = body

  if (!name || !email || !projectType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("Missing Airtable credentials")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  try {
    // Save to Airtable
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
      const detail = await airtableRes.text()
      console.error("Airtable error:", detail)
    }

    // Send email notification via sleftpayments API
    try {
      await fetch("https://www.sleftpayments.com/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || "",
          businessName: practiceName || "Sleft Signals Consulting",
          conversationSummary: `New Consulting Request from sleftsignals.com\nProject Type: ${projectType}\nBudget: ${budget || "N/A"}\nDescription: ${description}`,
        }),
      })
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Consulting submission error:", err)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}
