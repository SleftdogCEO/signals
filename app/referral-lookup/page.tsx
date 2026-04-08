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

// Reasons why a specialty refers to another specialty -- based on clinical reality
const referralReasons: Record<string, Record<string, string>> = {
  Chiropractors: {
    "Physical Therapists": "Patients needing rehab exercises and long-term mobility work after spinal adjustments",
    "Orthopedic Surgeons": "Complex spinal or joint cases requiring imaging, surgical evaluation, or injections",
    "Pain Management Specialists": "Chronic pain patients who need interventional procedures or medication management",
    "Primary Care Physicians": "Patients with systemic health concerns discovered during chiropractic evaluation",
  },
  "Physical Therapists": {
    "Orthopedic Surgeons": "Post-rehab patients who plateau and may need surgical intervention",
    Chiropractors: "Patients with spinal alignment issues that complement their PT program",
    "Pain Management Specialists": "Chronic pain patients who need interventional procedures beyond therapy",
    "Sports Medicine Doctors": "Athletes needing comprehensive sports injury evaluation and management",
  },
  Dentists: {
    Orthodontists: "Patients with malocclusion, crowding, or bite alignment issues",
    "Oral Surgeons": "Wisdom tooth extractions, implant placement, and jaw surgery cases",
    Periodontists: "Patients with advanced gum disease requiring specialized periodontal treatment",
    "Pediatric Dentists": "Young patients needing age-specific dental care and behavior management",
  },
  Orthodontists: {
    "General Dentists": "Patients completing orthodontic treatment who need restorative or cosmetic work",
    "Oral Surgeons": "Surgical orthodontic cases requiring jaw repositioning or impacted tooth exposure",
    "Pediatric Dentists": "Young patients needing primary dental care alongside orthodontic treatment",
    "TMJ Specialists": "Patients with temporomandibular joint dysfunction related to bite alignment",
  },
  Dermatologists: {
    "Primary Care Physicians": "Patients with skin conditions that indicate systemic disease requiring PCP follow-up",
    "Med Spas": "Cosmetic patients seeking treatments like Botox or laser that complement medical dermatology",
    "Plastic Surgeons": "Patients needing surgical removal of skin lesions or reconstructive procedures",
    Allergists: "Patients with chronic skin reactions suggesting underlying allergic conditions",
  },
  "Primary Care Physicians": {
    "Specialists (All)": "Any condition requiring specialist evaluation, from cardiology to orthopedics",
    "Mental Health Providers": "Patients with depression, anxiety, or behavioral health needs identified during visits",
    "Physical Therapists": "Musculoskeletal injuries and post-surgical rehabilitation referrals",
    Dermatologists: "Skin lesions, rashes, and dermatologic conditions beyond primary care scope",
  },
  "Orthopedic Surgeons": {
    "Physical Therapists": "Post-surgical rehab for joint replacements, ACL repairs, and fracture recovery",
    "Pain Management Specialists": "Non-surgical chronic pain cases requiring injections or nerve blocks",
    "Primary Care Physicians": "Patients with medical comorbidities needing ongoing primary care management",
    "Sports Medicine Doctors": "Non-surgical musculoskeletal cases better managed conservatively",
  },
  "Pain Management Specialists": {
    "Primary Care Physicians": "Patients needing ongoing chronic disease management alongside pain treatment",
    "Orthopedic Surgeons": "Patients failing conservative pain management who may benefit from surgery",
    Chiropractors: "Patients who would benefit from spinal manipulation as part of multimodal pain care",
    "Physical Therapists": "Patients needing functional rehabilitation alongside interventional pain procedures",
  },
  "Mental Health Providers": {
    "Primary Care Physicians": "Patients needing medical evaluation for physical symptoms or medication management",
    Psychiatrists: "Patients requiring psychiatric medication management alongside therapy",
    Pediatricians: "Child and adolescent patients needing developmental or medical evaluation",
    "School Counselors": "Students needing academic or behavioral support in the school setting",
  },
  "Med Spas": {
    Dermatologists: "Patients with medical skin conditions that need clinical dermatologic treatment",
    "Plastic Surgeons": "Patients wanting surgical procedures beyond what med spa treatments can achieve",
    "OB-GYNs": "Patients interested in hormone therapy or women's wellness services",
    "Primary Care Physicians": "Patients with underlying health conditions identified during consultations",
  },
  Pediatricians: {
    "Pediatric Dentists": "Children needing dental care, especially those with first-tooth milestones",
    "Child Psychologists": "Children showing behavioral, developmental, or emotional health concerns",
    Allergists: "Pediatric patients with chronic allergies, asthma, or food sensitivities",
    "Pediatric Orthopedists": "Children with growth plate injuries, scoliosis, or musculoskeletal concerns",
  },
  Optometrists: {
    Ophthalmologists: "Patients needing cataract surgery, glaucoma treatment, or retinal procedures",
    "Primary Care Physicians": "Patients with systemic conditions detected during eye exams (diabetes, hypertension)",
    Pediatricians: "Children with vision issues affecting learning and development",
    Neurologists: "Patients with visual disturbances suggesting neurological conditions",
  },
  Podiatrists: {
    "Primary Care Physicians": "Diabetic patients needing comprehensive primary care alongside foot care",
    "Orthopedic Surgeons": "Complex foot and ankle cases requiring surgical intervention",
    Endocrinologists: "Diabetic patients with foot complications needing endocrine management",
    "Physical Therapists": "Patients needing gait training and lower extremity rehabilitation",
  },
  "Oral Surgeons": {
    "General Dentists": "Post-surgical patients returning for restorative dental work and ongoing care",
    Orthodontists: "Patients needing orthodontic treatment after surgical jaw correction",
    ENTs: "Patients with overlapping oral and ear/nose/throat conditions",
    Oncologists: "Patients with oral pathology requiring oncologic evaluation and treatment",
  },
  Cardiologists: {
    "Primary Care Physicians": "Patients needing ongoing primary care management of cardiovascular risk factors",
    Endocrinologists: "Diabetic patients with cardiovascular complications needing endocrine care",
    Pulmonologists: "Patients with heart failure and concomitant pulmonary disease",
    "Cardiac Surgeons": "Patients needing coronary bypass, valve replacement, or other cardiac surgery",
  },
  "ENT Doctors": {
    "Primary Care Physicians": "Patients with general health needs identified during ENT evaluation",
    Allergists: "Patients with chronic sinusitis driven by underlying allergic conditions",
    Pediatricians: "Pediatric patients with ear infections and tonsil issues needing primary care",
    Audiologists: "Patients with hearing loss needing audiometric testing and hearing aid fitting",
  },
  Allergists: {
    "Primary Care Physicians": "Patients with chronic conditions needing ongoing primary care management",
    "ENT Doctors": "Patients with structural sinus issues contributing to allergy symptoms",
    Pediatricians: "Pediatric allergy patients needing well-child care and vaccination management",
    Dermatologists: "Patients with allergic skin conditions needing dermatologic treatment",
  },
  Urologists: {
    "Primary Care Physicians": "Patients needing ongoing chronic disease management alongside urologic care",
    "OB-GYNs": "Female patients with pelvic floor or incontinence issues overlapping gynecology",
    Nephrologists: "Patients with kidney disease requiring nephrology co-management",
    Oncologists: "Patients with urologic cancers needing oncologic treatment and monitoring",
  },
  Psychiatrists: {
    "Primary Care Physicians": "Patients needing medical management of physical health conditions",
    Therapists: "Patients needing psychotherapy alongside psychiatric medication management",
    Neurologists: "Patients with neuropsychiatric conditions needing neurologic evaluation",
    Pediatricians: "Pediatric patients needing developmental and medical follow-up",
  },
  "Sports Medicine Doctors": {
    "Orthopedic Surgeons": "Athletes with injuries requiring surgical intervention beyond conservative care",
    "Physical Therapists": "Athletes needing structured rehabilitation programs for injury recovery",
    "Primary Care Physicians": "Athletes with medical conditions requiring primary care management",
    Chiropractors: "Athletes with spinal and musculoskeletal issues benefiting from chiropractic care",
  },
  "Plastic Surgeons": {
    Dermatologists: "Patients with skin conditions requiring medical dermatology follow-up post-surgery",
    "Med Spas": "Patients wanting non-surgical maintenance treatments after plastic surgery",
    "OB-GYNs": "Post-mastectomy reconstruction patients needing ongoing gynecologic care",
    "Primary Care Physicians": "Patients needing pre-surgical clearance and ongoing health management",
  },
  Endocrinologists: {
    "Primary Care Physicians": "Diabetic and thyroid patients needing comprehensive primary care management",
    "OB-GYNs": "PCOS and fertility patients needing gynecologic management alongside hormone therapy",
    Cardiologists: "Diabetic patients with cardiovascular complications needing cardiology care",
    Podiatrists: "Diabetic patients developing foot complications needing podiatric monitoring",
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
