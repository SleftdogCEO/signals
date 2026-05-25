"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Phone,
  MapPin,
  ExternalLink,
  Loader2,
  Search,
  Stethoscope,
  Sparkles,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { classifyAffiliation } from "@/lib/affiliation"

// Grant-only internal CRM. RLS also enforces this server-side; this is the
// client-side gate so non-admins are bounced instead of seeing an empty board.
const ADMIN_ID = "03a3c4d5-b500-4810-b353-64bd8bdd4764"

const STATUSES: { value: string; label: string; cls: string }[] = [
  { value: "to_contact", label: "To contact", cls: "bg-slate-700/40 text-slate-300 border-slate-600" },
  { value: "contacted", label: "Contacted", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  { value: "call_booked", label: "Call booked", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { value: "joined", label: "Joined", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { value: "dead", label: "Dead", cls: "bg-red-500/10 text-red-300 border-red-500/25" },
]

interface Lead {
  npi: string
  practice_name: string
  specialty: string | null
  type: string | null
  enumeration_date: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  phone: string | null
  status: string
  notes: string | null
  referral_pain: string | null
}

const metaUrl = (name: string) =>
  `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&search_type=keyword_unordered&q=${encodeURIComponent(name)}`
const googleUrl = (name: string) =>
  `https://adstransparency.google.com/?region=US&query=${encodeURIComponent(name)}`

function isNew(date: string | null): boolean {
  if (!date) return false
  const t = Date.parse(date)
  if (Number.isNaN(t)) return false
  return Date.now() - t < 1000 * 60 * 60 * 24 * 548 // ~18 months
}

export default function OutreachPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [independentOnly, setIndependentOnly] = useState(true)
  const [savingNpi, setSavingNpi] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/auth?redirect=/dashboard/outreach")
      return
    }
    if (user.id !== ADMIN_ID) {
      router.replace("/dashboard")
      return
    }
    const load = async () => {
      const { data, error } = await supabase
        .from("outreach_leads")
        .select("*")
        .order("enumeration_date", { ascending: false, nullsFirst: false })
      if (!error && data) setLeads(data as Lead[])
      setLoading(false)
    }
    load()
  }, [user, authLoading, router])

  const patchLead = async (npi: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.npi === npi ? { ...l, ...patch } : l)))
    setSavingNpi(npi)
    await supabase
      .from("outreach_leads")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("npi", npi)
    setSavingNpi(null)
  }

  const specialties = useMemo(
    () => Array.from(new Set(leads.map((l) => l.specialty).filter(Boolean))).sort() as string[],
    [leads]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const l of leads) c[l.status] = (c[l.status] || 0) + 1
    return c
  }, [leads])

  // How many leads are health-system-employed (not viable independent partners).
  const systemCount = useMemo(
    () => leads.filter((l) => !classifyAffiliation(l.practice_name).isIndependent).length,
    [leads]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      if (independentOnly && !classifyAffiliation(l.practice_name).isIndependent) return false
      if (specialtyFilter !== "all" && l.specialty !== specialtyFilter) return false
      if (statusFilter !== "all" && l.status !== statusFilter) return false
      if (q && !(`${l.practice_name} ${l.city} ${l.specialty}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [leads, search, specialtyFilter, statusFilter, independentOnly])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold">Outreach</h1>
          </div>
          <Link href="/dashboard/network/hub" className="text-sm text-slate-400 hover:text-white">
            ← Back to network
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-2xl font-extrabold">Tampa call list</h2>
          <span className="text-sm text-slate-500">{leads.length} practices · newest first</span>
        </div>

        {/* Pipeline summary */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(statusFilter === s.value ? "all" : s.value)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${s.cls} ${
                statusFilter === s.value ? "ring-2 ring-white/30" : ""
              }`}
            >
              {s.label}: {counts[s.value] || 0}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search practice, city, specialty..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
          >
            <option value="all">All specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => setIndependentOnly((v) => !v)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              independentOnly
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
            title="Health-system-employed providers refer inside their own system — usually not worth a call"
          >
            {independentOnly ? "✓ Independent only" : "Show all"}
            {systemCount > 0 && (
              <span className="ml-2 text-xs text-slate-500">({systemCount} system-affiliated)</span>
            )}
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-500">{filtered.length} shown</p>

        {/* Leads */}
        <div className="space-y-3">
          {filtered.map((l) => {
            const aff = classifyAffiliation(l.practice_name)
            return (
            <div
              key={l.npi}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold">{l.practice_name}</h3>
                    {isNew(l.enumeration_date) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                        <Sparkles className="w-3 h-3" /> New {l.enumeration_date?.slice(0, 7)}
                      </span>
                    )}
                    {!aff.isIndependent && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                        {aff.system} · refers in-system
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                    {l.specialty && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-medium">
                        {l.specialty}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {[l.city, l.state].filter(Boolean).join(", ")}
                    </span>
                    {l.phone && (
                      <a href={`tel:${l.phone}`} className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200">
                        <Phone className="w-3.5 h-3.5" />
                        {l.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {savingNpi === l.npi && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
                  <select
                    value={l.status}
                    onChange={(e) => patchLead(l.npi, { status: e.target.value })}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ad checks */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <a
                  href={metaUrl(l.practice_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white"
                >
                  <ExternalLink className="w-3 h-3" /> Meta ads
                </a>
                <a
                  href={googleUrl(l.practice_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white"
                >
                  <ExternalLink className="w-3 h-3" /> Google ads
                </a>
              </div>

              {/* Capture */}
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <input
                  defaultValue={l.referral_pain || ""}
                  onBlur={(e) => {
                    if (e.target.value !== (l.referral_pain || "")) patchLead(l.npi, { referral_pain: e.target.value })
                  }}
                  placeholder="Biggest referral pain (the niche signal)..."
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                />
                <input
                  defaultValue={l.notes || ""}
                  onBlur={(e) => {
                    if (e.target.value !== (l.notes || "")) patchLead(l.npi, { notes: e.target.value })
                  }}
                  placeholder="Notes..."
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-12">No leads match your filters.</p>
          )}
        </div>
      </main>
    </div>
  )
}
