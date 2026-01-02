import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const briefId = params.id

    if (!briefId || briefId === 'null' || briefId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid brief ID' },
        { status: 400 }
      )
    }

    console.log(`Fetching brief ${briefId}`)

    // Check if it's a demo brief ID
    if (briefId.startsWith('demo-')) {
      // Return a placeholder - the data should have been passed via the redirect
      return NextResponse.json({
        error: 'Demo brief data not found. Please generate a new brief.',
        isDemo: true
      }, { status: 404 })
    }

    // Fetch from Supabase
    const { data: brief, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single()

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json(
        { error: 'Brief not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(brief)

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
    const briefId = params.id

    console.log(`Deleting brief ${briefId}`)

    // Handle demo briefs
    if (briefId.startsWith('demo-')) {
      return NextResponse.json({ success: true, message: 'Demo brief cleared' })
    }

    const { error } = await supabase
      .from('briefs')
      .delete()
      .eq('id', briefId)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete brief' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Delete Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
