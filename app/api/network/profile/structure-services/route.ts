import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

// Turns a practice's free-text service description into a one-line value
// proposition + concrete service tags, so matches and directory marketing can be
// tailored beyond bare specialty. Uses Claude with a constrained JSON schema.
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You structure a medical practice's free-text service description into a short marketing summary and tags, so the practice can be matched with, and pitched to, complementary referral partners.

Rules:
- value_prop: ONE concise sentence (max ~18 words) a referring physician would find compelling. No fluff, no marketing cliches, no em dashes.
- service_tags: 3 to 8 short, specific, lowercase service or treatment tags (e.g. "glp-1 therapy", "medically supervised weight loss", "bariatric pre-op clearance"). Prefer concrete clinical services over generic words.
- Stay strictly truthful to the input. Never invent services that were not described.`

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    value_prop: { type: "string" },
    service_tags: { type: "array", items: { type: "string" } },
  },
  required: ["value_prop", "service_tags"],
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI refinement is not configured yet." },
      { status: 503 }
    )
  }

  let body: { services?: string; specialty?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const services = (body.services || "").trim().slice(0, 2000)
  const specialty = (body.specialty || "").trim().slice(0, 120)
  if (services.length < 3) {
    return NextResponse.json(
      { error: "Describe your services first." },
      { status: 400 }
    )
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      // Static instructions cached; the per-practice text stays out of the prefix.
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Specialty: ${specialty || "(unspecified)"}\n\nServices described by the practice:\n"""${services}"""`,
        },
      ],
    } as Anthropic.MessageCreateParamsNonStreaming)

    const textBlock = msg.content.find((b) => b.type === "text")
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}"
    const parsed = JSON.parse(raw) as {
      value_prop?: string
      service_tags?: string[]
    }

    const tags = Array.isArray(parsed.service_tags)
      ? parsed.service_tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 8)
      : []

    return NextResponse.json({
      value_prop: String(parsed.value_prop || "").trim().slice(0, 240),
      service_tags: tags,
    })
  } catch (e: unknown) {
    console.error("structure-services error:", e instanceof Error ? e.message : e)
    return NextResponse.json(
      { error: "Could not structure your services. Please try again." },
      { status: 502 }
    )
  }
}
