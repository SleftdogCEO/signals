"use client"

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Sparkles, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar1 } from '@/components/ui/navbar-1'
import { Footer7 } from '@/components/ui/footer-7'

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initializeSession = async () => {
      // Check for code in URL (from Supabase password reset email)
      const code = searchParams.get('code')

      if (code) {
        try {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Error exchanging code:', error)
            toast.error('Invalid or expired reset link. Please request a new one.')
            router.push('/auth')
            return
          }
          console.log('Session established from reset code')
        } catch (err) {
          console.error('Error during code exchange:', err)
          toast.error('Something went wrong. Please try again.')
          router.push('/auth')
          return
        }
      } else {
        // No code - check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast.error('Invalid or expired reset link. Please request a new one.')
          router.push('/auth')
          return
        }
      }

      setInitializing(false)
    }

    initializeSession()
  }, [router, searchParams])

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      toast.success('Password updated successfully!')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      console.error('Password update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while initializing session
  if (initializing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar1 />

      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="bg-gray-900/80 backdrop-blur-xl border-yellow-500/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {success ? (
                  <CheckCircle className="w-8 h-8 text-black" />
                ) : (
                  <Sparkles className="w-8 h-8 text-black" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                {success ? 'Password Updated!' : 'Set New Password'}
              </CardTitle>
              <p className="text-gray-400">
                {success
                  ? 'Redirecting you to the dashboard...'
                  : 'Enter your new password below'}
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              {!success ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-yellow-500" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400 focus:border-yellow-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-yellow-500" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400 focus:border-yellow-500"
                    />
                  </div>

                  <Button
                    onClick={handleResetPassword}
                    disabled={loading || !password || !confirmPassword}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer7 />
    </div>
  )
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

// Main export wrapped in Suspense for useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
