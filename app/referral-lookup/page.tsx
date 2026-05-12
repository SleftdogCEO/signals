"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Zap,
  Search,
  MapPin,
  ArrowRight,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Activity,
  ChevronDown,
  Star,
  Network,
} from "lucide-react"
import { specialties } from "@/lib/seo-data"
import type { Specialty } from "@/lib/seo-data"

// Reasons why a specialty refers to another specialty -- based on clinical reality.
// Keys mirror the .plural values in lib/seo-data.ts. Inner keys mirror that
// specialty's refersTo array. Keep this map in lockstep with seo-data.ts so
// dynamic lookups in buildOutboundReferrals / buildReverseReferralMap surface
// specific clinical reasons instead of falling back to generic copy.
const referralReasons: Record<string, Record<string, string>> = {
  "Primary Care Physicians": {
    Cardiologists: "Patients with HTN, CHF, AFib, abnormal stress tests, chest pain workup, or strong CV family history",
    Endocrinologists: "Type 2 diabetes uncontrolled on two oral agents, thyroid nodules, suspected PCOS, or hormonal disorders",
    Psychiatrists: "Failed SSRI trials, treatment-resistant depression, adult ADHD evaluation, or complex med management",
    Dermatologists: "Suspicious skin lesions, persistent rashes, and chronic conditions beyond primary care scope",
  },
  Cardiologists: {
    "Primary Care Physicians": "Stable patients returning for ongoing CV risk management after cardiology workup is complete",
    Endocrinologists: "Diabetic patients with significant CV risk who need glycemic optimization",
    Pulmonologists: "Patients with cardiopulmonary overlap, sleep apnea cardiac risk, or pulmonary hypertension",
    "Sports Medicine Doctors": "Athletes with cardiac concerns or exercise tolerance issues",
  },
  Pulmonologists: {
    "Primary Care Physicians": "Stable patients with chronic conditions returning to PCP for ongoing management",
    Allergists: "Patients with difficult-to-control asthma where allergic component drives airway disease",
    Cardiologists: "Patients with CHF vs COPD differentiation, pulmonary hypertension, or cardiopulmonary overlap",
    "ENT Doctors": "Patients with upper airway involvement or chronic sinusitis affecting lower airway disease",
  },
  Endocrinologists: {
    "Primary Care Physicians": "Well-controlled diabetic and thyroid patients sent back for ongoing primary care management",
    Cardiologists: "Diabetic patients with cardiovascular complications needing co-management",
    Pediatricians: "Pediatric Type 1 diabetes, pediatric thyroid disorders, and growth concerns",
    "OB-GYNs": "PCOS, gestational diabetes, thyroid in pregnancy, or hormonal infertility evaluation",
  },
  Gastroenterologists: {
    "Primary Care Physicians": "Stable IBD, GERD, or celiac patients returning to PCP for ongoing chronic disease care",
    Pediatricians: "Pediatric chronic abdominal pain, failure to thrive, or pediatric IBD evaluation",
    Rheumatologists: "IBD patients with extraintestinal manifestations or rheumatologic comorbidities",
    Allergists: "Eosinophilic esophagitis, food allergy workup, or IgE-mediated GI symptoms",
  },
  Rheumatologists: {
    "Primary Care Physicians": "Patients with stable autoimmune conditions returning for ongoing chronic care",
    Dermatologists: "Psoriatic arthritis, lupus skin findings, or connective tissue disease with dermatologic features",
    "Pain Management Specialists": "Fibromyalgia and inflammatory pain syndromes needing interventional pain care",
    Gastroenterologists: "IBD-associated arthritis where GI workup drives diagnosis",
  },
  Neurologists: {
    "Primary Care Physicians": "Patients with stable migraine or neuropathy returning to PCP for ongoing care",
    Psychiatrists: "Cognitive disorders with significant mood components or functional neurological symptoms",
    Pediatricians: "Pediatric patients with seizures, developmental concerns, or migraine",
    "Pain Management Specialists": "Neuropathic pain patients needing interventional procedures",
  },
  Psychiatrists: {
    "Primary Care Physicians": "Patients needing medical workup for physical symptoms or medication interactions",
    Pediatricians: "Pediatric patients needing ongoing pediatric care alongside psychiatric treatment",
    Neurologists: "Patients with cognitive decline, post-stroke depression, or functional neurologic concerns",
    "Pain Management Specialists": "Chronic pain patients with mood disorder comorbidity needing interventional care",
  },
  Dermatologists: {
    "Primary Care Physicians": "Patients with stable skin conditions returning for ongoing primary care management",
    "Plastic Surgeons": "Post-Mohs reconstruction cases or patients seeking aesthetic procedures",
    Allergists: "Chronic eczema, contact dermatitis, or atopic dermatitis with allergic features",
    Pediatricians: "Pediatric skin conditions, severe acne, or eczema in young patients",
  },
  Ophthalmologists: {
    "Primary Care Physicians": "Stable patients with chronic eye conditions returning for ongoing primary care",
    Endocrinologists: "Diabetic retinopathy screening and follow-up for diabetic patients",
    Pediatricians: "Pediatric vision concerns, amblyopia, or strabismus",
    Neurologists: "Optic neuritis, visual field defects, papilledema workups, or migraine with aura",
  },
  "Orthopedic Surgeons": {
    "Pain Management Specialists": "Non-surgical chronic MSK pain or post-op pain needing interventional procedures",
    "Primary Care Physicians": "Stable post-op patients returning to PCP for ongoing medical management",
    "Sports Medicine Doctors": "Non-operative MSK injuries better managed conservatively",
  },
  "Pain Management Specialists": {
    "Primary Care Physicians": "Stable chronic pain patients on established regimens returning to PCP for ongoing care",
    "Orthopedic Surgeons": "Patients failing conservative pain management who may benefit from surgery",
    Rheumatologists: "Patients with inflammatory or autoimmune pain syndromes needing systemic treatment",
    Psychiatrists: "Chronic pain patients with significant mood disorder comorbidity",
  },
  Pediatricians: {
    Allergists: "Pediatric patients with food allergies, eczema, asthma, or chronic allergic rhinitis",
    "ENT Doctors": "Chronic otitis, tonsillitis, recurrent ear infections, or hearing concerns",
    Psychiatrists: "Adolescent depression, anxiety, or ADHD requiring medication management",
    Endocrinologists: "Pediatric Type 1 diabetes, pediatric thyroid disorders, or growth concerns",
  },
  "ENT Doctors": {
    "Primary Care Physicians": "Patients with stable conditions returning for ongoing primary care",
    Allergists: "Patients with chronic sinusitis driven by underlying allergic disease",
    Pulmonologists: "Patients with upper airway involvement in lower respiratory disease",
    Pediatricians: "Pediatric patients needing well-child care alongside ENT follow-up",
  },
  Allergists: {
    "Primary Care Physicians": "Stable allergy patients on established regimens returning for ongoing primary care",
    "ENT Doctors": "Patients with structural sinus issues contributing to allergic symptoms",
    Pediatricians: "Pediatric allergy patients needing developmental and vaccination management",
    Pulmonologists: "Difficult-to-control asthma needing pulmonary workup beyond allergy management",
  },
  Urologists: {
    "Primary Care Physicians": "Stable patients post-procedure returning for ongoing primary care",
    "OB-GYNs": "Female patients with pelvic floor disorders, recurrent UTIs, or urinary incontinence overlap",
  },
  "OB-GYNs": {
    "Primary Care Physicians": "Women needing comprehensive primary care beyond gynecologic scope",
    Endocrinologists: "PCOS, thyroid in pregnancy, gestational diabetes, or hormonal disorders",
    Urologists: "Pelvic floor disorders, recurrent UTIs, or urinary incontinence",
    Psychiatrists: "Postpartum depression, PMDD, or perimenopausal mood disorders",
  },
  "Sports Medicine Doctors": {
    "Orthopedic Surgeons": "Athletes with injuries requiring surgical intervention beyond conservative care",
    "Primary Care Physicians": "Athletes with medical conditions requiring primary care management",
    Endocrinologists: "Athletes with metabolic or hormonal concerns affecting performance",
  },
  "Plastic Surgeons": {
    Dermatologists: "Patients needing dermatologic follow-up after reconstructive or cosmetic surgery",
    "Primary Care Physicians": "Patients needing pre-surgical clearance or chronic condition management",
    "OB-GYNs": "Post-mastectomy reconstruction patients needing ongoing gynecologic care",
  },
}

interface ReferralPartner {
  specialtyName: string
  referralPotential: "High" | "Medium" | "Low"
  reason: string
  direction: "inbound" | "outbound" | "bidirectional"
}

function buildReverseReferralMap(
  targetSpecialty: Specialty
): ReferralPartner[] {
  const partners: ReferralPartner[] = []
  const targetPlural = targetSpecialty.plural
  const targetName = targetSpecialty.name

  // Find specialties that refer TO the selected specialty (inbound referrals)
  // This is the reverse lookup: scan every specialty's refersTo array for our target
  for (const spec of specialties) {
    if (spec.slug === targetSpecialty.slug) continue

    const refersToIndex = spec.refersTo.findIndex(
      (r) => r === targetPlural || r === targetName
    )

    if (refersToIndex !== -1) {
      // Check if our target also refers back to this specialty (bidirectional)
      const reverseIndex = targetSpecialty.refersTo.findIndex(
        (r) => r === spec.plural || r === spec.name
      )

      const potential: "High" | "Medium" | "Low" =
        refersToIndex === 0 ? "High" : refersToIndex === 1 ? "High" : refersToIndex === 2 ? "Medium" : "Low"

      const direction: "inbound" | "bidirectional" =
        reverseIndex !== -1 ? "bidirectional" : "inbound"

      // Get the reason from our referral reasons map
      const reasonsForSpec = referralReasons[spec.plural]
      const reason =
        reasonsForSpec?.[targetPlural] ||
        reasonsForSpec?.[targetName] ||
        `${spec.plural} commonly refer patients to ${targetPlural} based on complementary clinical needs`

      partners.push({
        specialtyName: spec.plural,
        referralPotential: potential,
        reason,
        direction,
      })
    }
  }

  // Sort: bidirectional first, then by potential (High > Medium > Low)
  const potentialOrder = { High: 0, Medium: 1, Low: 2 }
  const directionOrder = { bidirectional: 0, inbound: 1, outbound: 2 }

  partners.sort((a, b) => {
    const dirDiff = directionOrder[a.direction] - directionOrder[b.direction]
    if (dirDiff !== 0) return dirDiff
    return potentialOrder[a.referralPotential] - potentialOrder[b.referralPotential]
  })

  return partners
}

function buildOutboundReferrals(targetSpecialty: Specialty): ReferralPartner[] {
  return targetSpecialty.refersTo.map((refName, index) => {
    const potential: "High" | "Medium" | "Low" =
      index <= 1 ? "High" : index === 2 ? "Medium" : "Low"

    const reasonsForTarget = referralReasons[targetSpecialty.plural]
    const reason =
      reasonsForTarget?.[refName] ||
      `${targetSpecialty.plural} commonly refer patients to ${refName} for complementary care`

    return {
      specialtyName: refName,
      referralPotential: potential,
      reason,
      direction: "outbound" as const,
    }
  })
}

const potentialColors = {
  High: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

const directionLabels = {
  inbound: "Refers to you",
  outbound: "You refer to them",
  bidirectional: "Two-way referrals",
}

const directionColors = {
  inbound: "text-blue-400",
  outbound: "text-cyan-400",
  bidirectional: "text-emerald-400",
}

export default function ReferralLookupPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [location, setLocation] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const specialty = useMemo(
    () => specialties.find((s) => s.slug === selectedSpecialty),
    [selectedSpecialty]
  )

  const inboundPartners = useMemo(
    () => (specialty ? buildReverseReferralMap(specialty) : []),
    [specialty]
  )

  const outboundPartners = useMemo(
    () => (specialty ? buildOutboundReferrals(specialty) : []),
    [specialty]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSpecialty) {
      setHasSearched(true)
    }
  }

  const highPotentialCount = inboundPartners.filter(
    (p) => p.referralPotential === "High"
  ).length
  const bidirectionalCount = inboundPartners.filter(
    (p) => p.direction === "bidirectional"
  ).length
  const topReferrer = inboundPartners[0]?.specialtyName || "N/A"

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-200px] left-[10%] w-[600px] h-[600px] bg-blue-500/[0.07] rounded-full blur-[160px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[140px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sleft Signals</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Blog
          </Link>
          <Link
            href="/auth?signup=true"
            className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-20 px-6 lg:px-12 pt-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <Search className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">
                Instant Referral Partner Lookup
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
                Who Sends Patients to Your Specialty?
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Select your specialty below. We will instantly show you every
              provider type that refers to you, why they refer, and how
              strong the referral relationship is. No email required.
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 mb-10"
          >
            <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Specialty
                </label>
                <div className="relative">
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => {
                      setSelectedSpecialty(e.target.value)
                      setHasSearched(false)
                    }}
                    required
                    className="w-full appearance-none px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors pr-10"
                  >
                    <option value="">Select your specialty...</option>
                    {specialties.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Zip Code or City{" "}
                  <span className="text-slate-500">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 33410 or Tampa, FL"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/25 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Find Partners
              </button>
            </div>
          </form>

          {/* Results */}
          {hasSearched && specialty && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <div className="text-3xl font-black text-blue-400">
                    {inboundPartners.length}
                  </div>
                  <div className="text-sm text-slate-500">
                    Specialties That Refer to You
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <div className="text-3xl font-black text-emerald-400">
                    {highPotentialCount}
                  </div>
                  <div className="text-sm text-slate-500">
                    High-Potential Sources
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <div className="text-3xl font-black text-cyan-400">
                    {bidirectionalCount}
                  </div>
                  <div className="text-sm text-slate-500">
                    Two-Way Relationships
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <div className="text-lg font-bold text-amber-400 truncate">
                    {topReferrer}
                  </div>
                  <div className="text-sm text-slate-500">
                    Top Referral Source
                  </div>
                </div>
              </div>

              {/* Location context */}
              {location && (
                <div className="bg-blue-500/[0.06] border border-blue-500/15 rounded-xl px-5 py-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-300">
                      Showing referral partner types for{" "}
                      <span className="text-white font-semibold">
                        {specialty.plural}
                      </span>{" "}
                      near{" "}
                      <span className="text-white font-semibold">
                        {location}
                      </span>
                      . The specialties below are the provider types most likely
                      to send you patients in your area.
                    </p>
                  </div>
                </div>
              )}

              {/* Inbound Referrals Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Who Refers Patients to {specialty.plural}
                    </h2>
                    <p className="text-sm text-slate-500">
                      These specialties actively send patients your way
                    </p>
                  </div>
                </div>

                {inboundPartners.length > 0 ? (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_3fr] gap-4 px-6 py-3 border-b border-slate-800 bg-slate-900/50">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Specialty
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Referral Potential
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Relationship
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Why They Refer to You
                      </div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-800/50">
                      {inboundPartners.map((partner, index) => (
                        <div
                          key={index}
                          className="p-5 md:p-0 md:grid md:grid-cols-[2fr_1fr_1fr_3fr] md:gap-4 md:px-6 md:py-4 hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Specialty Name */}
                          <div className="flex items-center gap-3 mb-3 md:mb-0">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="font-semibold text-white">
                              {partner.specialtyName}
                            </span>
                          </div>

                          {/* Potential Badge */}
                          <div className="flex items-center mb-2 md:mb-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${potentialColors[partner.referralPotential]}`}
                            >
                              <Star className="w-3 h-3" />
                              {partner.referralPotential}
                            </span>
                          </div>

                          {/* Direction */}
                          <div className="flex items-center mb-2 md:mb-0">
                            <span
                              className={`text-xs font-medium flex items-center gap-1 ${directionColors[partner.direction]}`}
                            >
                              {partner.direction === "bidirectional" ? (
                                <ArrowLeftRight className="w-3 h-3" />
                              ) : (
                                <ArrowRight className="w-3 h-3 rotate-180" />
                              )}
                              {directionLabels[partner.direction]}
                            </span>
                          </div>

                          {/* Reason */}
                          <div className="text-sm text-slate-400 leading-relaxed">
                            {partner.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center">
                    <p className="text-slate-500">
                      No inbound referral data found for this specialty. This
                      specialty may primarily refer patients outward.
                    </p>
                  </div>
                )}
              </div>

              {/* Referral Map - Visual Relationship Diagram */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <Network className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Referral Relationship Map
                    </h2>
                    <p className="text-sm text-slate-500">
                      How {specialty.plural} connect with other specialties
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8">
                  <div className="flex flex-col items-center">
                    {/* Center node */}
                    <div className="relative w-full max-w-3xl">
                      {/* Inbound side */}
                      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                        {/* Left: Who refers to you */}
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider text-center md:text-right mb-3">
                            Refers to You
                          </p>
                          {inboundPartners.slice(0, 5).map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 justify-center md:justify-end"
                            >
                              <span className="text-sm text-slate-300 font-medium">
                                {p.specialtyName}
                              </span>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  p.referralPotential === "High"
                                    ? "bg-emerald-400"
                                    : p.referralPotential === "Medium"
                                    ? "bg-amber-400"
                                    : "bg-slate-500"
                                }`}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Center: Your specialty */}
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-6 border-t border-dashed border-blue-500/30 hidden md:block" />
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-2xl flex flex-col items-center justify-center text-center p-3">
                            <Activity className="w-6 h-6 text-blue-400 mb-1" />
                            <span className="text-sm font-bold text-white leading-tight">
                              {specialty.name}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              Your Practice
                            </span>
                          </div>
                          <div className="w-6 border-t border-dashed border-cyan-500/30 hidden md:block" />
                        </div>

                        {/* Right: Who you refer to */}
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider text-center md:text-left mb-3">
                            You Refer to
                          </p>
                          {outboundPartners.slice(0, 5).map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 justify-center md:justify-start"
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  p.referralPotential === "High"
                                    ? "bg-emerald-400"
                                    : p.referralPotential === "Medium"
                                    ? "bg-amber-400"
                                    : "bg-slate-500"
                                }`}
                              />
                              <span className="text-sm text-slate-300 font-medium">
                                {p.specialtyName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-800 w-full justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-xs text-slate-500">
                          High potential
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-xs text-slate-500">
                          Medium potential
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                        <span className="text-xs text-slate-500">
                          Lower potential
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outbound Referrals - Cards */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Who You Can Refer Patients To
                    </h2>
                    <p className="text-sm text-slate-500">
                      Build two-way relationships by referring to these
                      specialties
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {outboundPartners.map((partner, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white">
                          {partner.specialtyName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${potentialColors[partner.referralPotential]}`}
                        >
                          {partner.referralPotential}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {partner.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialty Description */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-white mb-3">
                  About {specialty.name} Referral Networks
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {specialty.description}
                </p>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-14 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Connect with Real Providers?
                </h2>
                <p className="text-lg text-slate-400 mb-4 max-w-2xl mx-auto">
                  You just saw which specialties refer to{" "}
                  {specialty.plural.toLowerCase()}. Now let us show you the
                  actual providers in{" "}
                  {location ? (
                    <span className="text-white font-semibold">{location}</span>
                  ) : (
                    "your area"
                  )}{" "}
                  who could become your referral partners.
                </p>
                <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                  Join Sleft Signals to get matched with real, verified practices
                  near you. We handle the outreach so you can focus on patient
                  care.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/snapshot"
                    className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg rounded-xl hover:from-blue-400 hover:to-cyan-400 transition-all shadow-xl shadow-blue-500/25"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Get Your Free Snapshot
                  </Link>
                  <Link
                    href="/auth?signup=true"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-white/10 bg-white/[0.03] text-white font-semibold rounded-xl hover:border-blue-500/20 hover:bg-blue-500/[0.04] transition-all"
                  >
                    Join the Network
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <p className="text-sm text-slate-500 mt-5">
                  Free to join. No credit card required.
                </p>
              </div>
            </div>
          )}

          {/* Pre-search state: show specialty grid for discovery */}
          {!hasSearched && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Browse by Specialty
                </h2>
                <p className="text-slate-400">
                  Click any specialty to instantly see its referral network
                </p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specialties.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      setSelectedSpecialty(s.slug)
                      setHasSearched(true)
                    }}
                    className="text-left bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all group"
                  >
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Refers to: {s.refersTo.slice(0, 2).join(", ")}
                      {s.refersTo.length > 2 && ` +${s.refersTo.length - 2}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Sleft Signals</span>
          </div>
          <span className="text-sm text-slate-500">
            Local referral intelligence for healthcare practices
          </span>
        </div>
      </footer>
    </div>
  )
}
