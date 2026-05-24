"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth setup if environment variables are missing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase environment variables are missing")
      setLoading(false)
      return
    }

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
        // Do NOT redirect here. This block runs on every navigation, so any
        // redirect traps logged-in users and blocks public pages like /,
        // /directory, and /blog. Post-login redirects are handled by the
        // SIGNED_IN event below.
      } catch (error) {
        console.error("Auth error:", error)
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)

      setUser(session?.user ?? null)
      setLoading(false)

      // Redirect only on an actual sign-in: return the user to wherever they
      // were headed before being bounced to /auth, otherwise into the app. Never
      // redirect while they're already browsing in-app or on a public page.
      if (event === "SIGNED_IN" && session?.user) {
        const redirectPath = sessionStorage.getItem("redirectAfterAuth")
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterAuth")
          router.push(redirectPath)
        } else if (pathname.startsWith("/auth")) {
          router.push("/dashboard")
        }
      }

      if (event === "SIGNED_OUT") {
        console.log("User signed out, redirecting to home")
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      sessionStorage.removeItem("redirectAfterAuth")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
