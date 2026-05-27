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

// Cardiometabolic-first ordering (Grant's thesis). Unknown specialties sort last.
const SPECIALTY_RANK: Record<string, number> = {
  "Obesity Medicine": 1,
  "Endocrinology": 2,
  "Cardiology": 3,
  "Primary Care": 4,
  "Gastroenterology": 5,
  "OB-GYN": 6,
  "Psychiatry": 7,
}

// Mirror of outreach_leads.quality enum (set by the manual tagging pass).
const QUALITY_LABEL: Record<string, string> = {
  good: "Callable",
  dup: "Duplicate NPI",
  system: "System-employed",
  chain: "Corporate / chain",
  telehealth_shell: "Telehealth shell",
  out_of_metro: "Out of metro",
}

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
  quality: string | null
  quality_reason: string | null
  llc_formation_date: string | null
  llc_checked_at: string | null
}

// Months between an ISO date and now. Returns null if input is null/invalid.
function monthsSince(iso: string | null): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  const days = (Date.now() - t) / 86400000
  return Math.round(days / 30.44)
}

function llcAgeLabel(months: number | null): { label: string; cls: string } | null {
  if (months === null) return null
  if (months < 0) return { label: `LLC ${Math.abs(months)} mo (future date?)`, cls: "bg-red-500/15 text-red-300 border-red-500/30" }
  if (months < 18) return { label: `LLC ${months} mo`, cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" }
  if (months < 60) return { label: `LLC ${Math.round(months / 12 * 10) / 10} yr`, cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" }
  return { label: `LLC ${Math.floor(months / 12)} yr`, cls: "bg-slate-700/40 text-slate-400 border-slate-600" }
}

// Marketing-pulse links (ICP signal: is this practice actively spending on ads?)
const metaAdsUrl = (name: string) =>
  `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&search_type=keyword_unordered&q=${encodeURIComponent(name)}`
const googleAdsUrl = (name: string) =>
  `https://adstransparency.google.com/?region=US&query=${encodeURIComponent(name)}`

// Verification links (ICP signal: is this a real, new, identifiable practice?)
const googleSearchUrl = (name: string, city: string | null) =>
  `https://www.google.com/search?q=${encodeURIComponent(`"${name}" ${city || "Tampa"} FL`)}`
const googleMapsUrl = (name: string, city: string | null) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city || "Tampa"} FL`)}`
const nppesUrl = (npi: string) =>
  `https://npiregistry.cms.hhs.gov/provider-view/${npi}`
const sunbizUrl = (name: string) =>
  // Strip suffixes that confuse the Sunbiz fuzzy match
  `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults?inquiryType=EntityName&searchTerm=${encodeURIComponent(
    name.replace(/[,.]/g, "").replace(/\b(LLC|PLLC|INC|PA|PC|MD|DO|CORP|LP|LTD)\b/gi, "").trim()
  )}`

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
  // 'callable' = quality='good' only (default), 'filtered' = everything we dropped, 'all' = no filter
  const [qualityView, setQualityView] = useState<"callable" | "filtered" | "all">("callable")
  // ICP filter: only show practices whose LLC is <18mo old (Grant's "new practices" ICP)
  const [newLlcOnly, setNewLlcOnly] = useState(false)
  const [newNpiOnly, setNewNpiOnly] = useState(false)
  // Sort mode: 'cluster' = cardiometabolic first then newest NPI; 'llc_newest' = newest LLC first (untyped at end)
  const [sortMode, setSortMode] = useState<"cluster" | "llc_newest">("cluster")
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

  // Volume counters for the three-way quality toggle.
  const qualityCounts = useMemo(() => {
    let callable = 0
    let filtered = 0
    for (const l of leads) {
      if (l.quality === "good") callable++
      else if (l.quality) filtered++
    }
    return { callable, filtered, all: leads.length }
  }, [leads])

  // ICP progress: how many callable leads have we vetted on Sunbiz, and how many are <18mo?
  const llcCounts = useMemo(() => {
    let vetted = 0
    let newPractice = 0
    for (const l of leads) {
      if (l.quality !== "good") continue
      if (l.llc_formation_date) {
        vetted++
        const m = monthsSince(l.llc_formation_date)
        if (m !== null && m < 18 && m >= 0) newPractice++
      }
    }
    return { vetted, newPractice }
  }, [leads])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matched = leads.filter((l) => {
      if (qualityView === "callable" && l.quality !== "good") return false
      if (qualityView === "filtered" && (l.quality === "good" || !l.quality)) return false
      if (specialtyFilter !== "all" && l.specialty !== specialtyFilter) return false
      if (statusFilter !== "all" && l.status !== statusFilter) return false
      if (q && !(`${l.practice_name} ${l.city} ${l.specialty}`.toLowerCase().includes(q))) return false
      if (newLlcOnly) {
        const m = monthsSince(l.llc_formation_date)
        if (m === null || m >= 18) return false
      }
      if (newNpiOnly) {
        const m = monthsSince(l.enumeration_date)
        if (m === null || m >= 18) return false
      }
      return true
    })

    if (sortMode === "llc_newest") {
      // Newest LLC first; un-vetted leads sink to the bottom so they don't crowd the ICP
      return matched.slice().sort((a, b) => {
        const ta = a.llc_formation_date ? Date.parse(a.llc_formation_date) : -Infinity
        const tb = b.llc_formation_date ? Date.parse(b.llc_formation_date) : -Infinity
        return tb - ta
      })
    }
    // Default: cardiometabolic cluster first, then newest NPI inside each specialty
    return matched.slice().sort((a, b) => {
      const ra = SPECIALTY_RANK[a.specialty || ""] ?? 99
      const rb = SPECIALTY_RANK[b.specialty || ""] ?? 99
      if (ra !== rb) return ra - rb
      const da = a.enumeration_date ? Date.parse(a.enumeration_date) : 0
      const db = b.enumeration_date ? Date.parse(b.enumeration_date) : 0
      return db - da
    })
  }, [leads, search, specialtyFilter, statusFilter, qualityView, newLlcOnly, newNpiOnly, sortMode])

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
        <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-2xl font-extrabold">Tampa call list</h2>
          <span className="text-sm text-slate-500">
            {qualityCounts.callable} callable of {qualityCounts.all}
          </span>
          <span className="text-sm text-emerald-400">
            {llcCounts.newPractice} new LLC (&lt;18mo) · {llcCounts.vetted}/{qualityCounts.callable} Sunbiz-vetted
          </span>
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
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-sm font-medium">
            {([
              { v: "callable", label: "Callable", n: qualityCounts.callable, cls: "bg-emerald-500/20 text-emerald-300" },
              { v: "filtered", label: "Filtered out", n: qualityCounts.filtered, cls: "bg-amber-500/20 text-amber-300" },
              { v: "all", label: "All", n: qualityCounts.all, cls: "bg-blue-500/20 text-blue-300" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setQualityView(opt.v)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  qualityView === opt.v ? opt.cls : "text-slate-400 hover:text-white"
                }`}
                title={
                  opt.v === "callable"
                    ? "Independent Tampa-metro practices — the only ones worth dialing"
                    : opt.v === "filtered"
                    ? "Practices auto-tagged as system-employed, corporate chain, telehealth shell, out-of-metro, or duplicate"
                    : "Every NPI in the table, untouched"
                }
              >
                {opt.label} <span className="ml-1 text-xs opacity-70">{opt.n}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setNewNpiOnly((v) => !v)}
            title="ICP filter: only practices whose NPI was enumerated in the last 18 months — cheap newness signal before Sunbiz vetting"
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              newNpiOnly
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {newNpiOnly ? "✓ New NPI only (<18mo)" : "+ New NPI only"}
          </button>
          <button
            onClick={() => setNewLlcOnly((v) => !v)}
            title="ICP filter: only practices whose LLC was filed in the last 18 months"
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              newLlcOnly
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {newLlcOnly ? "✓ New LLC only (<18mo)" : "+ New LLC only"}
          </button>
          <button
            onClick={() => setSortMode((m) => (m === "cluster" ? "llc_newest" : "cluster"))}
            title="Toggle between cardiometabolic-cluster ordering and newest-LLC-first"
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-sm font-medium"
          >
            Sort: {sortMode === "cluster" ? "Cluster + NPI" : "Newest LLC"}
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-500">{filtered.length} shown</p>

        {/* Leads */}
        <div className="space-y-3">
          {filtered.map((l) => {
            // Fallback to the legacy classifier for any lead that hasn't been quality-tagged yet
            // (e.g. brand-new NPIs imported after the manual pass).
            const aff = classifyAffiliation(l.practice_name)
            const flagged = l.quality && l.quality !== "good"
            const llcMonths = monthsSince(l.llc_formation_date)
            const llcBadge = llcAgeLabel(llcMonths)
            return (
            <div
              key={l.npi}
              className={`rounded-2xl border p-5 ${
                flagged ? "border-amber-900/40 bg-slate-900/40 opacity-80" : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold">{l.practice_name}</h3>
                    {isNew(l.enumeration_date) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                        <Sparkles className="w-3 h-3" /> New NPI {l.enumeration_date?.slice(0, 7)}
                      </span>
                    )}
                    {llcBadge && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${llcBadge.cls}`}
                        title={`Sunbiz filed ${l.llc_formation_date}`}
                      >
                        {llcBadge.label}
                      </span>
                    )}
                    {flagged && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold"
                        title={l.quality_reason || ""}
                      >
                        {QUALITY_LABEL[l.quality!] || l.quality}
                        {l.quality_reason ? ` · ${l.quality_reason}` : ""}
                      </span>
                    )}
                    {!flagged && !l.quality && !aff.isIndependent && (
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

              {/* Verification — is this a real, new, identifiable practice? */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 self-center mr-1">Verify</span>
                <a
                  href={googleSearchUrl(l.practice_name, l.city)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="What does the web know about this practice?"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-600/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                >
                  <ExternalLink className="w-3 h-3" /> Google
                </a>
                <a
                  href={googleMapsUrl(l.practice_name, l.city)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Reviews, claim status, photos, first-review date = practice age signal"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-600/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                >
                  <ExternalLink className="w-3 h-3" /> Maps
                </a>
                <a
                  href={nppesUrl(l.npi)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="NPPES record — who is the doc behind this org NPI?"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-600/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                >
                  <ExternalLink className="w-3 h-3" /> NPPES
                </a>
                <a
                  href={sunbizUrl(l.practice_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="FL Sunbiz — LLC formation date (= practice age), registered agent, owner"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-600/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                >
                  <ExternalLink className="w-3 h-3" /> Sunbiz
                </a>
                <label
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-400 text-[11px]"
                  title="After clicking Sunbiz, type the LLC file date here (YYYY-MM-DD) to capture practice age"
                >
                  <span className="text-slate-500">LLC date:</span>
                  <input
                    type="date"
                    defaultValue={l.llc_formation_date || ""}
                    onBlur={(e) => {
                      const v = e.target.value || null
                      if (v !== (l.llc_formation_date || null)) {
                        patchLead(l.npi, {
                          llc_formation_date: v,
                          llc_checked_at: new Date().toISOString(),
                        })
                      }
                    }}
                    className="bg-transparent text-slate-200 text-[11px] outline-none [color-scheme:dark] w-[110px]"
                  />
                </label>
              </div>
              {/* Marketing pulse — is this practice actively spending on ads? */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 self-center mr-1">Marketing</span>
                <a
                  href={metaAdsUrl(l.practice_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Active Meta ads = ad spend + growth focus"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white"
                >
                  <ExternalLink className="w-3 h-3" /> Meta ads
                </a>
                <a
                  href={googleAdsUrl(l.practice_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Active Google ads = ad spend + intent"
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
