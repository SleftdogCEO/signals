import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const type = requestUrl.searchParams.get('type')

  // Handle OAuth error
  if (error) {
    console.error('❌ OAuth error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=oauth_error`)
  }

  // Check if this is a password recovery flow
  if (type === 'recovery') {
    console.log('🔑 Password recovery flow detected')
    // Redirect to reset password page with the code
    return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password${code ? `?code=${code}` : ''}`)
  }

  if (code) {
    // Create Supabase client for server-side
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
        const isNewUser = timeDiff < 10000 // Less than 10 seconds difference
        
        if (isNewUser) {
          console.log('🆕 New Google user signup detected')
          
          // Send to Airtable for new Google signups (non-blocking)
          try {
            const response = await fetch(`${requestUrl.origin}/api/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
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
            } else {
              console.warn('⚠️ Airtable recording failed:', await response.text())
            }
          } catch (error) {
            console.error('❌ Failed to send Google signup to Airtable:', error)
            // Don't fail the auth flow if Airtable fails
          }
        } else {
          console.log('🔄 Existing user login via Google')
        }

        // Check if user has a provider profile
        try {
          const { data: provider, error } = await supabase
            .from('providers')
            .select('id')
            .eq('user_id', data.user.id)
            .single()

          if (error || !provider) {
            // Table doesn't exist or no profile - go to network (demo mode)
            console.log('📝 No provider profile or table - redirecting to network')
            return NextResponse.redirect(`${requestUrl.origin}/dashboard/network`)
          }

          // Has profile - redirect to network
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/network`)
        } catch (e) {
          // On any error, go to network
          console.log('Provider check failed, going to network')
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/network`)
        }
      }
    } catch (error) {
      console.error('❌ Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=callback_error`)
    }
  }

  // No code provided - redirect to auth
  console.log('⚠️ No auth code provided')
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}