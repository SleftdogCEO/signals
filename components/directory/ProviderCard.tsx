"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Globe, ArrowRight, ArrowLeft, Loader2, Star, BadgeCheck } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { categoryLabel, isUnclaimed, type DirectoryProvider } from "@/lib/directory"

function Chips({
  ids,
  tone,
}: {
  ids: string[]
  tone: "blue" | "emerald"
}) {
  if (!ids || ids.length === 0) {
    return <span className="text-sm text-slate-600">Not specified yet</span>
  }
  const cls =
    tone === "blue"
      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <span
          key={id}
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
        >
          {categoryLabel(id)}
        </span>
      ))}
    </div>
  )
}

export default function ProviderCard({
  provider,
}: {
  provider: DirectoryProvider
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  const unclaimed = isUnclaimed(provider)

  const handleRequestIntro = async () => {
    // Gate: must be signed in.
    if (!user) {
      router.push("/auth?redirect=/directory")
      return
    }

    setLoading(true)
    try {
      // The requester must have completed onboarding (have a provider row).
      const { data: requester } = await supabase
        .from("providers")
        .select("id, practice_name, specialty, location, email")
        .eq("user_id", user.id)
        .single()

      if (!requester) {
        toast.error("Finish setting up your practice first.")
        router.push("/onboarding")
        return
      }

      if (requester.id === provider.id) {
        toast.error("That's your own practice.")
        return
      }

      // Record the intro request. Unique(provider_a, provider_b) means a
      // repeat request simply surfaces as "already requested".
      const { error } = await supabase.from("matches").insert({
        provider_a: requester.id,
        provider_b: provider.id,
        initiated_by: requester.id,
        status: "pending",
      })

      if (error && error.code !== "23505") throw error

      // Notify Grant so he can broker the introduction.
      await fetch("/api/directory/request-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterName: requester.practice_name,
          requesterEmail: requester.email || user.email,
          requesterSpecialty: requester.specialty,
          requesterLocation: requester.location,
          targetName: provider.practice_name,
          targetSpecialty: provider.specialty,
          targetLocation: provider.location,
        }),
      })

      setRequested(true)
      toast.success(
        error?.code === "23505"
          ? "You've already requested this introduction."
          : "Introduction requested. We'll be in touch."
      )
    } catch (err) {
      console.error("Request intro failed:", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all hover:border-blue-500/40">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400" />

      <div className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug text-white">
            {provider.practice_name}
          </h3>
          {unclaimed ? (
            <span className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              Unclaimed
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
              <BadgeCheck className="h-3.5 w-3.5" />
              Member
            </span>
          )}
        </div>

        {/* Specialty + location */}
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <span className="rounded-full bg-blue-500/10 px-3 py-1 font-medium text-blue-300">
            {provider.specialty}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="h-4 w-4" />
            {provider.location}
          </span>
          {provider.rating ? (
            <span className="flex items-center gap-1 text-slate-400">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {provider.rating}
              {provider.review_count ? (
                <span className="text-slate-500">({provider.review_count})</span>
              ) : null}
            </span>
          ) : null}
        </div>

        {/* Bio */}
        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {provider.bio ||
            (unclaimed
              ? "This practice hasn't joined Sleft Signals yet. Request an introduction and we'll reach out."
              : "No practice bio added yet.")}
        </p>

        {/* Referral preferences */}
        <div className="mb-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ArrowRight className="h-3.5 w-3.5" />
            Refers out to
          </p>
          <Chips ids={provider.patients_i_refer} tone="blue" />
        </div>
        <div className="mb-5">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ArrowLeft className="h-3.5 w-3.5" />
            Looking for
          </p>
          <Chips ids={provider.patients_i_want} tone="emerald" />
        </div>

        {/* Website */}
        {provider.website ? (
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 flex items-center gap-1.5 truncate text-sm text-cyan-400 hover:text-cyan-300"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {provider.website.replace(/^https?:\/\//, "")}
            </span>
          </a>
        ) : null}

        {/* Action */}
        <button
          onClick={handleRequestIntro}
          disabled={loading || requested}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition-all hover:from-blue-400 hover:to-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : requested ? (
            "Introduction Requested"
          ) : unclaimed ? (
            "Invite This Practice"
          ) : (
            "Request Introduction"
          )}
        </button>
      </div>
    </div>
  )
}
