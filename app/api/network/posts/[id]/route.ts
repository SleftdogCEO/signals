import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get post with provider info and comments
    const { data: post, error: postError } = await supabase
      .from('network_posts')
      .select(`
        *,
        provider:providers(id, practice_name, specialty, location)
      `)
      .eq('id', id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get comments
    const { data: comments } = await supabase
      .from('network_comments')
      .select(`
        *,
        provider:providers(id, practice_name, specialty)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    // Increment view count
    await supabase
      .from('network_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', id)

    return NextResponse.json({
      post,
      comments: comments || []
    })
  } catch (error) {
    console.error('Post GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, content, parentCommentId } = body

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get provider
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Create comment
    const { data: comment, error: insertError } = await supabase
      .from('network_comments')
      .insert({
        post_id: id,
        provider_id: provider.id,
        content: content.trim(),
        parent_comment_id: parentCommentId || null
      })
      .select(`
        *,
        provider:providers(id, practice_name, specialty)
      `)
      .single()

    if (insertError) {
      console.error('Error creating comment:', insertError)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    // Update comment count on post
    await supabase.rpc('increment_comment_count', { post_id: id })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Comment POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
