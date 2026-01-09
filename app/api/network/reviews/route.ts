import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const VALID_REVIEW_TYPES = [
  'ehr_software',
  'practice_management',
  'payment_processing',
  'marketing_service',
  'billing_service',
  'telehealth',
  'scheduling',
  'patient_communication',
  'ai_tool',
  'other'
] as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewType = searchParams.get('type')
    const productName = searchParams.get('product')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sort') || 'recent' // recent, rating, helpful

    let query = supabase
      .from('network_reviews')
      .select(`
        *,
        provider:providers(id, practice_name, specialty, location)
      `)

    // Filter by type
    if (reviewType && VALID_REVIEW_TYPES.includes(reviewType as typeof VALID_REVIEW_TYPES[number])) {
      query = query.eq('review_type', reviewType)
    }

    // Filter by product name (case insensitive search)
    if (productName) {
      query = query.ilike('product_name', `%${productName}%`)
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        query = query.order('overall_rating', { ascending: false })
        break
      case 'helpful':
        query = query.order('helpful_count', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: reviews, error } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // Get aggregate stats per product
    const { data: productStats } = await supabase
      .from('network_reviews')
      .select('product_name, overall_rating')

    // Calculate average ratings per product
    const statsMap: Record<string, { count: number; total: number }> = {}
    productStats?.forEach(r => {
      if (!statsMap[r.product_name]) {
        statsMap[r.product_name] = { count: 0, total: 0 }
      }
      statsMap[r.product_name].count++
      statsMap[r.product_name].total += r.overall_rating
    })

    const productAverages = Object.entries(statsMap).map(([name, stats]) => ({
      product_name: name,
      avg_rating: Math.round((stats.total / stats.count) * 10) / 10,
      review_count: stats.count
    })).sort((a, b) => b.review_count - a.review_count)

    return NextResponse.json({
      reviews: reviews || [],
      productStats: productAverages.slice(0, 10),
      total: reviews?.length || 0
    })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      reviewType,
      productName,
      vendorName,
      overallRating,
      easeOfUse,
      valueForMoney,
      customerSupport,
      title,
      pros,
      cons,
      reviewContent,
      wouldRecommend
    } = body

    // Validate required fields
    if (!userId || !reviewType || !productName || !overallRating || !title || !reviewContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get provider
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, subscription_status')
      .eq('user_id', userId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Check subscription
    if (!['trial', 'active'].includes(provider.subscription_status)) {
      return NextResponse.json(
        { error: 'Active subscription required to review' },
        { status: 403 }
      )
    }

    // Check for existing review of same product by same provider
    const { data: existingReview } = await supabase
      .from('network_reviews')
      .select('id')
      .eq('provider_id', provider.id)
      .ilike('product_name', productName)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      )
    }

    const { data: review, error: insertError } = await supabase
      .from('network_reviews')
      .insert({
        provider_id: provider.id,
        review_type: reviewType,
        product_name: productName.trim(),
        vendor_name: vendorName?.trim() || null,
        overall_rating: overallRating,
        ease_of_use: easeOfUse || null,
        value_for_money: valueForMoney || null,
        customer_support: customerSupport || null,
        title: title.trim(),
        pros: pros?.trim() || null,
        cons: cons?.trim() || null,
        review_content: reviewContent.trim(),
        would_recommend: wouldRecommend !== false
      })
      .select(`
        *,
        provider:providers(id, practice_name, specialty, location)
      `)
      .single()

    if (insertError) {
      console.error('Error creating review:', insertError)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
