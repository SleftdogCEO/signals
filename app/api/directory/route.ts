import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Public read of the provider directory. RLS allows anonymous SELECT on
// rows where is_active = true, so the anon key is sufficient here.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PAGE_SIZE = 24

const SELECT_COLUMNS =
  "id,user_id,practice_name,specialty,location,bio,value_prop,service_tags,website,patients_i_want,patients_i_refer,is_seeded,is_verified,rating,review_count,created_at"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get("specialty")?.trim()
    const location = searchParams.get("location")?.trim()
    const wants = searchParams.get("wants")?.trim() // category id
    const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10))

    let query = supabase
      .from("providers")
      .select(SELECT_COLUMNS, { count: "exact" })
      .eq("is_active", true)
      .eq("network_opted_in", true)

    if (specialty) query = query.eq("specialty", specialty)
    if (location) query = query.ilike("location", `%${location}%`)
    // "wants" filters to providers actively looking for that referral category.
    if (wants) query = query.contains("patients_i_want", [wants])

    // Claimed members first, then most recently added.
    const { data, count, error } = await query
      .order("user_id", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (error) {
      console.error("Directory query error:", error)
      return NextResponse.json({ error: "Query failed" }, { status: 500 })
    }

    return NextResponse.json({
      providers: data || [],
      total: count || 0,
      page,
      pageSize: PAGE_SIZE,
      hasMore: (count || 0) > (page + 1) * PAGE_SIZE,
    })
  } catch (err) {
    console.error("Directory route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
