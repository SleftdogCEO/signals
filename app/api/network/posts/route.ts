import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const VALID_CATEGORIES = [
  'software',
  'payment_processing',
  'marketing',
  'practice_management',
  'ai_tools',
  'patient_experience',
  'hiring',
  'insurance',
  'general',
  'announcement'
] as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('network_posts')
      .select(`
        *,
        provider:providers(id, practice_name, specialty, location)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
      query = query.eq('category', category)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // Get total count
    const { count } = await supabase
      .from('network_posts')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })
  } catch (error) {
    console.error('Posts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, content, category } = body

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, content' },
        { status: 400 }
      )
    }

    // Get provider ID from user ID
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, subscription_status')
      .eq('user_id', userId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      )
    }

    // Check subscription (trial or active can post)
    if (!['trial', 'active'].includes(provider.subscription_status)) {
      return NextResponse.json(
        { error: 'Active subscription required to post' },
        { status: 403 }
      )
    }

    // Validate category
    const postCategory = VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])
      ? category
      : 'general'

    const { data: post, error: insertError } = await supabase
      .from('network_posts')
      .insert({
        provider_id: provider.id,
        title: title.trim(),
        content: content.trim(),
        category: postCategory
      })
      .select(`
        *,
        provider:providers(id, practice_name, specialty, location)
      `)
      .single()

    if (insertError) {
      console.error('Error creating post:', insertError)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Posts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
