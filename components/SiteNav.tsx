"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, Menu, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// Single source of truth for site navigation. Every marketing page renders this
// instead of its own hardcoded <nav>, so the link set is consistent and the
// high-value pages (Find Partners, Free Lookup, Directory) are reachable from
// every page. Includes a mobile hamburger -- the old per-page navs had none.
const NAV_LINKS = [
  { href: "/find-referral-partners", label: "Find Partners" },
  { href: "/referral-lookup", label: "Free Lookup" },
  { href: "/directory", label: "Directory" },
  { href: "/blog", label: "Blog" },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuth()
  const loggedIn = !loading && !!user

  return (
    <header className="relative z-50">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sleft Signals</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/auth?signup=true"
                className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden px-6 pb-4">
          <div className="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur p-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg font-medium text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="h-px bg-slate-800 my-2" />
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg bg-white text-slate-900 font-semibold text-center"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg font-medium text-slate-200 hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?signup=true"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg bg-white text-slate-900 font-semibold text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
