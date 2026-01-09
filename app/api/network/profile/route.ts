import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Fetch provider profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching provider:', error)
      return NextResponse.json(
        { error: 'Failed to fetch provider' },
        { status: 500 }
      )
    }

    return NextResponse.json({ provider })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update provider profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    // Check if provider exists
    const { data: existing } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing provider
      const { data, error } = await supabase
        .from('providers')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating provider:', error)
        return NextResponse.json(
          { error: 'Failed to update provider' },
          { status: 500 }
        )
      }

      return NextResponse.json({ provider: data })
    } else {
      // Create new provider
      const { data, error } = await supabase
        .from('providers')
        .insert({
          user_id: userId,
          ...profileData,
          network_opted_in: true,
          subscription_status: 'trial'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating provider:', error)
        return NextResponse.json(
          { error: 'Failed to create provider' },
          { status: 500 }
        )
      }

      return NextResponse.json({ provider: data })
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
