import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get provider
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Check if already upvoted
    const { data: existingUpvote } = await supabase
      .from('network_upvotes')
      .select('id')
      .eq('provider_id', provider.id)
      .eq('post_id', postId)
      .single()

    if (existingUpvote) {
      // Remove upvote
      await supabase
        .from('network_upvotes')
        .delete()
        .eq('id', existingUpvote.id)

      // Decrement count
      const { data: post } = await supabase
        .from('network_posts')
        .select('upvotes')
        .eq('id', postId)
        .single()

      await supabase
        .from('network_posts')
        .update({ upvotes: Math.max(0, (post?.upvotes || 1) - 1) })
        .eq('id', postId)

      return NextResponse.json({ upvoted: false })
    } else {
      // Add upvote
      await supabase
        .from('network_upvotes')
        .insert({
          provider_id: provider.id,
          post_id: postId
        })

      // Increment count
      const { data: post } = await supabase
        .from('network_posts')
        .select('upvotes')
        .eq('id', postId)
        .single()

      await supabase
        .from('network_posts')
        .update({ upvotes: (post?.upvotes || 0) + 1 })
        .eq('id', postId)

      return NextResponse.json({ upvoted: true })
    }
  } catch (error) {
    console.error('Upvote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
