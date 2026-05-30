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

// Founding-member phase: free to join while the Tampa network is built; the real
// price is being validated with early members, not hardcoded. The live Stripe
// charge (when used) is driven by STRIPE_PRICE_ID above, not this display config.
export const PLANS = {
  founding: {
    name: 'Founding Member',
    price: 0,
    interval: 'month' as const,
    features: [
      'Hand-brokered warm introductions to nearby practices',
      'We reach out to partners on your behalf',
      'Two-way, mutual-fit referral matches',
      'Founding rate locked in as the network grows',
      'Community and local market insights',
    ],
  },
}
