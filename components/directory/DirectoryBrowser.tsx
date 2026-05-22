"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Search, MapPin, Loader2, SlidersHorizontal } from "lucide-react"
import {
  CATEGORY_OPTIONS,
  SPECIALTY_OPTIONS,
  type DirectoryProvider,
} from "@/lib/directory"
import ProviderCard from "./ProviderCard"

interface Props {
  initialProviders: DirectoryProvider[]
  initialTotal: number
  initialHasMore: boolean
}

export default function DirectoryBrowser({
  initialProviders,
  initialTotal,
  initialHasMore,
}: Props) {
  const [providers, setProviders] = useState(initialProviders)
  const [total, setTotal] = useState(initialTotal)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)

  const [specialty, setSpecialty] = useState("")
  const [location, setLocation] = useState("")
  const [wants, setWants] = useState("")

  const [loading, setLoading] = useState(false)
  const firstRender = useRef(true)

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (specialty) params.set("specialty", specialty)
        if (location) params.set("location", location)
        if (wants) params.set("wants", wants)
        params.set("page", String(nextPage))

        const res = await fetch(`/api/directory?${params.toString()}`)
        const data = await res.json()
        const incoming: DirectoryProvider[] = data.providers || []

        setProviders((prev) => (append ? [...prev, ...incoming] : incoming))
        setTotal(data.total || 0)
        setHasMore(Boolean(data.hasMore))
        setPage(nextPage)
      } catch (err) {
        console.error("Directory fetch failed:", err)
      } finally {
        setLoading(false)
      }
    },
    [specialty, location, wants]
  )

  // Refetch from page 0 whenever a filter changes (debounced for the text input).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const t = setTimeout(() => fetchPage(0, false), 350)
    return () => clearTimeout(t)
  }, [specialty, location, wants, fetchPage])

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          Filter the directory
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All specialties</option>
            {SPECIALTY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or state"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={wants}
            onChange={(e) => setWants(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Looking for any referrals</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                Looking for: {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="mb-5 text-sm text-slate-400">
        {loading && providers.length === 0
          ? "Searching..."
          : `${total} ${total === 1 ? "practice" : "practices"} in the network`}
      </p>

      {/* Grid */}
      {providers.length === 0 && !loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <p className="text-slate-400">
            No practices match those filters yet. Try widening your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => fetchPage(page + 1, true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 font-semibold text-white transition-all hover:border-blue-500/40 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Load more practices
          </button>
        </div>
      ) : null}
    </div>
  )
}
