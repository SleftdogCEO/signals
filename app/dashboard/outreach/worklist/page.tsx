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
  const [tierFilter, setTierFilter] = useState<string>("A")
  const [copiedNpi, setCopiedNpi] = useState<string | null>(null)
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
          "npi,practice_name,specialty,city,state,phone,phone_verified,status,website,email,contact_form_url,contact_form_captcha,linkedin_url,best_channel,enrichment_notes,lead_score,lead_tier,outreach_draft,outreach_email_subject,outreach_email_body"
        )
        .not("enriched_at", "is", null)
        .order("lead_score", { ascending: false, nullsFirst: false })
      setLeads((data as Lead[]) || [])
      setLoading(false)
    })()
  }, [user])

  const filtered = useMemo(
    () => (tierFilter === "all" ? leads : leads.filter((l) => l.lead_tier === tierFilter)),
    [leads, tierFilter]
  )

  const tierCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const l of leads) c[l.lead_tier || "?"] = (c[l.lead_tier || "?"] || 0) + 1
    return c
  }, [leads])

  const draftFor = (l: Lead) => edits[l.npi] ?? l.outreach_draft ?? ""

  async function copy(l: Lead) {
    try {
      await navigator.clipboard.writeText(draftFor(l))
      setCopiedNpi(l.npi)
      setTimeout(() => setCopiedNpi((n) => (n === l.npi ? null : n)), 1500)
    } catch {}
  }

  async function setStatus(npi: string, status: string) {
    setLeads((ls) => ls.map((l) => (l.npi === npi ? { ...l, status } : l)))
    await supabase.from("outreach_leads").update({ status }).eq("npi", npi)
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
          {(["A", "B", "C", "D", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                tierFilter === t ? "bg-blue-500/20 border-blue-500/50 text-blue-200" : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {t === "all" ? `All (${leads.length})` : `${t} (${tierCounts[t] || 0})`}
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
                      <span className={`px-2 py-0.5 rounded-md border text-xs font-bold ${TIER_CLS[l.lead_tier || "D"]}`}>
                        {l.lead_tier} · {l.lead_score}
                      </span>
                      <span className="text-base font-bold">{l.practice_name}</span>
                      <span className={`px-2 py-0.5 rounded-md border text-xs ${STATUS_CLS[l.status] || STATUS_CLS.to_contact}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {l.specialty} · {l.city}, {l.state} · best via{" "}
                      <span className="text-slate-200 font-medium">{l.best_channel}</span>
                    </div>
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
                    onClick={() => setStatus(l.npi, "contacted")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 rounded-lg text-sm font-semibold hover:bg-emerald-500/25"
                  >
                    <Send className="w-4 h-4" /> Mark contacted
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
