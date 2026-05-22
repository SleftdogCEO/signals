"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// "See Your Referral Partners" hero CTA. Logged-in members go straight to the
// directory; logged-out visitors (and the brief auth-loading window) are
// funneled to sign-up.
export default function HeroReferralCTA() {
  const { user, loading } = useAuth()
  const href = !loading && user ? "/directory" : "/auth?signup=true"

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-blue-400 hover:to-cyan-400 transition-all shadow-xl shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
    >
      See Your Referral Partners
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Link>
  )
}
