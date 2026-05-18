import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Surface misconfiguration early. Silent fall-through to empty strings used to
// produce "Failed to fetch" errors in signup that were hard to diagnose because
// the client appeared to construct successfully but pointed at no host.
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Auth calls will fail with a network error. Check Vercel environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})