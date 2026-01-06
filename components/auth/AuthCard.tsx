"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthCard() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Get redirect URL from query params
  const getPostAuthRedirect = () => {
    if (typeof window === 'undefined') return '/dashboard';
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/dashboard';
  };

  const getRedirectURL = () => {
    const baseURL = process.env.NODE_ENV === 'production'
      ? 'https://signals-navy.vercel.app'
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // Include the post-auth redirect in the callback URL
    const postAuthRedirect = getPostAuthRedirect();
    return `${baseURL}/auth/callback?next=${encodeURIComponent(postAuthRedirect)}`;
  };

  // Function to send user data to Airtable (ONLY FOR NEW SIGNUPS)
  const sendToAirtable = async (userData: any) => {
    try {
      console.log('Sending NEW USER data to Airtable:', userData.email);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('New user data sent to Airtable successfully');
        toast.success('Welcome! You\'ve been added to our system.');
      } else {
        console.warn('Airtable integration failed:', result.warning || result.error);
        // Don't show error to user as registration was successful
      }
    } catch (error) {
      console.error('Failed to send to Airtable:', error);
      // Don't show error to user as registration was successful
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectURL(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      // For Google OAuth, we handle new user detection in the callback
      // Callback route will check if it's a new user and send to Airtable only then

    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    try {
      setLoading(true);

      if (type === 'signup') {
        // SIGNUP FLOW - Send to Airtable
        console.log('Processing NEW USER signup');

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
            emailRedirectTo: getRedirectURL()
          }
        });

        if (error) throw error;

        // ONLY send to Airtable for NEW signups
        if (data.user) {
          console.log('Sending new signup to Airtable');
          sendToAirtable({
            email: formData.email,
            fullName: formData.fullName,
            userId: data.user.id,
            authProvider: 'email',
            signupDate: new Date().toISOString()
          });
        }

        // If user is confirmed immediately (no email verification required), redirect
        if (data.session) {
          toast.success('Welcome! Loading your snapshot...');
          window.location.href = getPostAuthRedirect();
          return;
        }

        toast.success('Check your email for the confirmation link!');

        // Clear form
        setFormData({
          email: '',
          password: '',
          fullName: ''
        });

      } else {
        // LOGIN FLOW - DO NOT send to Airtable
        console.log('Processing EXISTING USER login');

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // REMOVED: Do NOT send login data to Airtable
        console.log('User logged in successfully - NOT sending to Airtable');

        toast.success('Welcome back!');
        // Redirect to requested page or dashboard
        window.location.href = getPostAuthRedirect();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      // Use callback URL with type=recovery to trigger password reset flow
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${getRedirectURL()}?type=recovery`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-2xl shadow-blue-500/10 relative overflow-hidden">
        <CardContent className="pt-6">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 mb-6 p-1 rounded-xl">
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-cyan-600 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 rounded-lg transition-all"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-cyan-600 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 rounded-lg transition-all"
              >
                Sign In
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-100 h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email
                  </Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-100 h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password-signup"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-100 pr-10 h-12 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => handleEmailAuth('signup')}
                  disabled={loading || !formData.email || !formData.password || !formData.fullName}
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-600 text-white font-semibold py-6 shadow-xl shadow-blue-500/25 rounded-xl text-base"
                >
                  {loading ? 'Creating account...' : 'Get Started'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-100 h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-100 pr-10 h-12 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => handleEmailAuth('login')}
                  disabled={loading || !formData.email || !formData.password}
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-600 text-white font-semibold py-6 shadow-xl shadow-blue-500/25 rounded-xl text-base"
                >
                  {loading ? 'Signing in...' : 'Find My Partners'}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-center text-sm text-blue-600 hover:text-cyan-600 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="outline"
            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 bg-white py-6 rounded-xl transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </Button>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/98 backdrop-blur-sm rounded-xl flex items-center justify-center p-6"
            >
              <div className="w-full space-y-4">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-100 h-12 rounded-xl"
                  />
                </div>

                <Button
                  onClick={handleForgotPassword}
                  disabled={loading || !formData.email}
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-600 text-white font-semibold py-6 shadow-xl shadow-blue-500/25 rounded-xl"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
