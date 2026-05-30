"use client"

// Assisted SDR worklist. Grant-only. Shows enriched + scored leads ranked by
// lead_score, each with its AI-drafted message and one-click actions:
//   - Open the practice's contact form + copy the message to paste
//   - Open a Gmail compose pre-filled with the email draft
//   - Mark the lead contacted
// The SDR drafts; Grant reviews and sends. Nothing is auto-submitted.

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, ExternalLink, Copy, Check, Mail, Phone, Linkedin, Globe, ArrowLeft, Send,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

const ADMIN_ID = "03a3c4d5-b500-4810-b353-64bd8bdd4764"

const TIER_CLS: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  B: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  C: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  D: "bg-slate-700/40 text-slate-400 border-slate-600",
}

const STATUS_CLS: Record<string, string> = {
  to_contact: "bg-slate-700/40 text-slate-300 border-slate-600",
  contacted: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  call_booked: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  joined: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  dead: "bg-red-500/10 text-red-300 border-red-500/25",
}

interface Lead {
  npi: string
  practice_name: string
  specialty: string | null
  city: string | null
  state: string | null
  phone: string | null
  phone_verified: string | null
  status: string
  website: string | null
  email: string | null
  contact_form_url: string | null
  contact_form_captcha: boolean | null
  linkedin_url: string | null
  best_channel: string | null
  enrichment_notes: string | null
  lead_score: number | null
  lead_tier: string | null
  practice_model: string | null
  score_reasons: string | null
  disqualified_reason: string | null
  cohort: string | null
  outreach_draft: string | null
  outreach_email_subject: string | null
  outreach_email_body: string | null
}

function gmailComposeUrl(to: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function WorklistPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  // Default to the A/B validation view: cohort A (reachable cash-pay) first.
  const [filter, setFilter] = useState<string>("A_reachable")
  const [copiedNpi, setCopiedNpi] = useState<string | null>(null)
  // Npi currently being saved to Supabase, so the button can show a spinner.
  const [savingNpi, setSavingNpi] = useState<string | null>(null)
  // Local edits to drafts, keyed by npi, so Grant can tweak before sending.
  const [edits, setEdits] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading && (!user || user.id !== ADMIN_ID)) router.replace("/dashboard")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || user.id !== ADMIN_ID) return
    ;(async () => {
      const { data } = await supabase
        .from("outreach_leads")
        .select(
          "npi,practice_name,specialty,city,state,phone,phone_verified,status,website,email,contact_form_url,contact_form_captcha,linkedin_url,best_channel,enrichment_notes,lead_score,lead_tier,practice_model,score_reasons,disqualified_reason,cohort,outreach_draft,outreach_email_subject,outreach_email_body"
        )
        .or("enriched_at.not.is.null,cohort.not.is.null")
        .order("lead_score", { ascending: false, nullsFirst: false })
      setLeads((data as Lead[]) || [])
      setLoading(false)
    })()
  }, [user])

  const filtered = useMemo(() => {
    if (filter === "all") return leads
    if (filter === "A_reachable") return leads.filter((l) => l.cohort === "A_reachable")
    if (filter === "B_newer") return leads.filter((l) => l.cohort === "B_newer")
    if (filter === "tierA") return leads.filter((l) => l.lead_tier === "A")
    if (filter === "tierB") return leads.filter((l) => l.lead_tier === "B")
    return leads
  }, [leads, filter])

  const counts = useMemo(
    () => ({
      A_reachable: leads.filter((l) => l.cohort === "A_reachable").length,
      B_newer: leads.filter((l) => l.cohort === "B_newer").length,
      tierA: leads.filter((l) => l.lead_tier === "A").length,
      tierB: leads.filter((l) => l.lead_tier === "B").length,
      all: leads.length,
    }),
    [leads]
  )

  const draftFor = (l: Lead) => edits[l.npi] ?? l.outreach_draft ?? ""

  async function copy(l: Lead) {
    try {
      await navigator.clipboard.writeText(draftFor(l))
      setCopiedNpi(l.npi)
      setTimeout(() => setCopiedNpi((n) => (n === l.npi ? null : n)), 1500)
    } catch {}
  }

  async function setStatus(npi: string, status: string) {
    const prevStatus = leads.find((l) => l.npi === npi)?.status
    setLeads((ls) => ls.map((l) => (l.npi === npi ? { ...l, status } : l)))
    setSavingNpi(npi)
    const { error } = await supabase
      .from("outreach_leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("npi", npi)
    setSavingNpi(null)
    if (error) {
      // Roll back the optimistic flip and surface the failure instead of
      // leaving the UI showing a state the database never accepted.
      setLeads((ls) => ls.map((l) => (l.npi === npi ? { ...l, status: prevStatus ?? l.status } : l)))
      alert(`Couldn't save status: ${error.message}`)
    }
  }

  async function saveDraft(l: Lead) {
    const v = draftFor(l)
    setLeads((ls) => ls.map((x) => (x.npi === l.npi ? { ...x, outreach_draft: v } : x)))
    await supabase.from("outreach_leads").update({ outreach_draft: v }).eq("npi", l.npi)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">SDR Worklist</h1>
          <Link href="/dashboard/outreach" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to CRM
          </Link>
        </div>
        <p className="text-slate-400 mb-6 text-base">
          Enriched and scored leads, highest first. The draft is written for you. Review it, open the contact
          form or Gmail, send, then mark contacted. Nothing is sent automatically.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { k: "A_reachable", label: `A/B · Reachable cash-pay (${counts.A_reachable})` },
            { k: "B_newer", label: `A/B · Newer owner-ops (${counts.B_newer})` },
            { k: "tierA", label: `Tier A (${counts.tierA})` },
            { k: "tierB", label: `Tier B (${counts.tierB})` },
            { k: "all", label: `All (${counts.all})` },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                filter === f.k ? "bg-blue-500/20 border-blue-500/50 text-blue-200" : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((l) => {
            const subject = l.outreach_email_subject || `A referral map I built for ${l.practice_name}`
            const body = l.outreach_email_body || draftFor(l)
            return (
              <div key={l.npi} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {l.lead_tier && (
                        <span className={`px-2 py-0.5 rounded-md border text-xs font-bold ${TIER_CLS[l.lead_tier]}`}>
                          {l.lead_tier} · {l.lead_score}
                        </span>
                      )}
                      {l.cohort === "B_newer" && (
                        <span className="px-2 py-0.5 rounded-md border text-xs font-bold bg-purple-500/15 text-purple-300 border-purple-500/40">
                          newer owner-op
                        </span>
                      )}
                      <span className="text-base font-bold">{l.practice_name}</span>
                      <span className={`px-2 py-0.5 rounded-md border text-xs ${STATUS_CLS[l.status] || STATUS_CLS.to_contact}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {l.specialty} · {l.city}, {l.state} · best via{" "}
                      <span className="text-slate-200 font-medium">{l.best_channel}</span>
                    </div>
                    {l.practice_model && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {l.practice_model.split(",").map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                            {m.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {l.score_reasons && <p className="text-xs text-slate-500 mt-1.5">Why: {l.score_reasons}</p>}
                    {l.disqualified_reason && <p className="text-xs text-red-400/80 mt-1">Excluded: {l.disqualified_reason}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    {l.website && (
                      <a href={l.website} target="_blank" rel="noreferrer" title="Website" className="hover:text-white"><Globe className="w-4 h-4" /></a>
                    )}
                    {l.linkedin_url && (
                      <a href={l.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn" className="hover:text-white"><Linkedin className="w-4 h-4" /></a>
                    )}
                    {(l.phone_verified || l.phone) && (
                      <a href={`tel:${(l.phone_verified || l.phone || "").replace(/[^0-9]/g, "")}`} title={l.phone_verified || l.phone || ""} className="flex items-center gap-1 hover:text-white text-sm">
                        <Phone className="w-4 h-4" /> {l.phone_verified || l.phone}
                      </a>
                    )}
                  </div>
                </div>

                {l.enrichment_notes && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{l.enrichment_notes}</p>
                )}

                <textarea
                  value={draftFor(l)}
                  onChange={(e) => setEdits((m) => ({ ...m, [l.npi]: e.target.value }))}
                  onBlur={() => saveDraft(l)}
                  placeholder="No draft yet. Write the outreach message here."
                  rows={5}
                  className="w-full mt-3 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-y"
                />
                {l.contact_form_captcha && (
                  <p className="text-xs text-amber-400/80 mt-1">Heads up: this form likely has a captcha, so you submit it manually.</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {l.contact_form_url && (
                    <a
                      href={l.contact_form_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => copy(l)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500/15 border border-blue-500/40 text-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-500/25"
                    >
                      <ExternalLink className="w-4 h-4" /> Open form + copy message
                    </a>
                  )}
                  {l.email && (
                    <a
                      href={gmailComposeUrl(l.email, subject, body)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-700"
                    >
                      <Mail className="w-4 h-4" /> Email via Gmail
                    </a>
                  )}
                  <button
                    onClick={() => copy(l)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-700"
                  >
                    {copiedNpi === l.npi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedNpi === l.npi ? "Copied" : "Copy message"}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setStatus(l.npi, l.status === "contacted" ? "to_contact" : "contacted")}
                    disabled={savingNpi === l.npi}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
                      l.status === "contacted"
                        ? "bg-emerald-500/30 border border-emerald-400 text-emerald-100 hover:bg-emerald-500/40"
                        : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25"
                    }`}
                  >
                    {savingNpi === l.npi ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : l.status === "contacted" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {l.status === "contacted" ? "Contacted" : "Mark contacted"}
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-slate-500 text-center py-12">No leads in this tier yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
