import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test mode - bypasses Stripe when STRIPE_SECRET_KEY is not set
const TEST_MODE = !process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, testMode } = body

    // Handle test mode - simulate successful subscription
    if (TEST_MODE || testMode) {
      if (!userId) {
        return NextResponse.json(
          { error: 'Missing user ID' },
          { status: 400 }
        )
      }

      // Update provider to have active subscription
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          subscription_status: 'active',
          subscription_id: `test_sub_${Date.now()}`,
          stripe_customer_id: `test_cus_${Date.now()}`
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Test mode update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to activate test subscription' },
          { status: 500 }
        )
      }

      // Return success URL for redirect
      const origin = request.headers.get('origin') || 'http://localhost:3001'
      return NextResponse.json({
        url: `${origin}/dashboard/network/hub?success=true&test=true`,
        testMode: true
      })
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const { providerId } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already has a Stripe customer
    const { data: provider } = await supabase
      .from('providers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = provider?.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
          provider_id: providerId || '',
        },
      })
      customerId = customer.id

      // Update provider with customer ID
      await supabase
        .from('providers')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/network?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/network/upgrade?canceled=true`,
      metadata: {
        user_id: userId,
        provider_id: providerId || '',
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          provider_id: providerId || '',
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)

    // Extract detailed Stripe error message
    let errorMessage = 'Failed to create checkout session'
    if (error && typeof error === 'object' && 'message' in error) {
      const stripeError = error as { message: string; type?: string }
      errorMessage = stripeError.message

      // Provide more helpful guidance for common errors
      if (errorMessage.includes('account or business name')) {
        errorMessage = 'Stripe account not fully configured. Please complete your Stripe account setup at https://dashboard.stripe.com/settings/account and ensure you have set a business name.'
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
