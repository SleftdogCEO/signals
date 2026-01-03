import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  // Handle OAuth error
  if (error) {
    console.error('❌ OAuth error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=oauth_error`)
  }

  // Check if this is a password recovery flow
  if (type === 'recovery') {
    console.log('🔑 Password recovery flow detected')
    return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password${code ? `?code=${code}` : ''}`)
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Session exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=session_error`)
      }

      if (data.user) {
        console.log('✅ OAuth callback successful for:', data.user.email)

        // Check if this is a new user (first time signup)
        const userCreatedAt = new Date(data.user.created_at)
        const userLastSignIn = new Date(data.user.last_sign_in_at || data.user.created_at)
        const timeDiff = Math.abs(userLastSignIn.getTime() - userCreatedAt.getTime())
        const isNewUser = timeDiff < 10000

        if (isNewUser) {
          console.log('🆕 New Google user signup detected')

          try {
            const response = await fetch(`${requestUrl.origin}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name ||
                         data.user.user_metadata?.name ||
                         data.user.user_metadata?.display_name || '',
                userId: data.user.id,
                authProvider: 'google'
              }),
            })

            if (response.ok) {
              console.log('✅ Google signup sent to Airtable')
            }
          } catch (error) {
            console.error('❌ Failed to send Google signup to Airtable:', error)
          }
        }

        // Redirect to the requested page (snapshot or dashboard)
        console.log('🔀 Redirecting to:', next)
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }
    } catch (error) {
      console.error('❌ Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=callback_error`)
    }
  }

  console.log('⚠️ No auth code provided')
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}