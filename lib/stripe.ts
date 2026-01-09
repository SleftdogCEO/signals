import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe features disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ''

export const PLANS = {
  warmIntros: {
    name: 'Warm Introductions',
    price: 250,
    interval: 'month' as const,
    features: [
      'We reach out to partners on your behalf',
      'Meetings scheduled for you',
      'Pre-qualified, mutual-fit partners',
      'Relationship facilitation support',
      'Access to community & insights',
    ],
  },
}
