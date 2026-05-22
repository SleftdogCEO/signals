import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import type { DirectoryProvider } from "@/lib/directory"
import DirectoryBrowser from "@/components/directory/DirectoryBrowser"

export const metadata: Metadata = {
  title: "Physician Referral Directory | Sleft Signals",
  description:
    "Browse physician practices in the Sleft Signals network. See each practice's specialty, location, what they refer out, and the referrals they're looking for.",
}

// Always reflect the latest providers.
export const dynamic = "force-dynamic"

const PAGE_SIZE = 24
const SELECT_COLUMNS =
  "id,user_id,practice_name,specialty,location,bio,website,patients_i_want,patients_i_refer,is_seeded,is_verified,rating,review_count,created_at"

async function loadInitialProviders(): Promise<{
  providers: DirectoryProvider[]
  total: number
  hasMore: boolean
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, count, error } = await supabase
    .from("providers")
    .select(SELECT_COLUMNS, { count: "exact" })
    .eq("is_active", true)
    .eq("network_opted_in", true)
    .order("user_id", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1)

  if (error) {
    console.error("Directory initial load error:", error)
    return { providers: [], total: 0, hasMore: false }
  }

  return {
    providers: (data as DirectoryProvider[]) || [],
    total: count || 0,
    hasMore: (count || 0) > PAGE_SIZE,
  }
}

export default async function DirectoryPage() {
  const { providers, total, hasMore } = await loadInitialProviders()

  return (
    <div className="min-h-screen overflow-hidden text-white">
      {/* Nav */}
      <nav className="relative z-40 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-white md:text-4xl"
        >
          Sleft Signals
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="font-medium text-slate-400 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/auth?signup=true"
            className="rounded-lg bg-white px-5 py-2.5 font-semibold text-slate-900 transition-colors hover:bg-slate-100"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="relative z-20 mx-auto max-w-7xl px-6 pb-10 pt-10 lg:px-12">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
            The Referral Directory
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          Browse physician practices near you. See what each one refers out, the
          referrals they want, and request a warm introduction.
        </p>
      </header>

      {/* Browser */}
      <main className="relative z-20 mx-auto max-w-7xl px-6 pb-24 lg:px-12">
        <DirectoryBrowser
          initialProviders={providers}
          initialTotal={total}
          initialHasMore={hasMore}
        />
      </main>
    </div>
  )
}
