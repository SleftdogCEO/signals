"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Check,
  Stethoscope,
  Loader2,
  Sparkles,
  SlidersHorizontal
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Partner categories shown on step 2. Each maps to a subset of the 19 physician
// specialties in lib/seo-data.ts. Adding or removing categories here must stay
// in sync with the marketplace -- a user who picks a category whose specialties
// aren't in seo-data.ts will get zero matches.
const PARTNER_CATEGORIES = [
  {
    id: "primary_care",
    label: "Primary Care",
    description: "Family medicine, internal medicine, general practice",
    icon: "🏥"
  },
  {
    id: "internal_medicine_subspecialties",
    label: "Internal Medicine Subspecialties",
    description: "Cardiology, pulmonology, endocrinology, gastroenterology, rheumatology, neurology",
    icon: "🩺"
  },
  {
    id: "psychiatry_pain",
    label: "Psychiatry & Pain Management",
    description: "Psychiatry, pain management, behavioral health bridging medical and surgical care",
    icon: "🧠"
  },
  {
    id: "surgery_msk",
    label: "Surgery & Musculoskeletal",
    description: "Orthopedic surgery, plastic surgery, urology, sports medicine",
    icon: "🦴"
  },
  {
    id: "womens_childrens",
    label: "Women's & Children's Health",
    description: "Pediatrics, OB-GYN, adolescent and pediatric specialty referrals",
    icon: "👶"
  },
  {
    id: "ent_eye_skin_allergy",
    label: "ENT, Eye, Skin & Allergy",
    description: "ENT, ophthalmology, dermatology, allergy and immunology",
    icon: "👁️"
  }
]

// Auto-recommend: map the user's own specialty to the partner CATEGORY ids most
// likely to exchange referrals with them. Used to pre-fill step 2 so we do the
// thinking for the user. Falls back to a broad, sensible set.
function recommendedCategoriesFor(specialty: string): string[] {
  const s = (specialty || "").toLowerCase()
  if (s.includes("dietit") || s.includes("dietic") || s.includes("nutrition"))
    return ["internal_medicine_subspecialties", "primary_care", "womens_childrens"]
  if (s.includes("weight") || s.includes("obesity"))
    return ["internal_medicine_subspecialties", "womens_childrens", "primary_care"]
  if (s.includes("primary") || s.includes("family") || s.includes("internal medicine"))
    return ["internal_medicine_subspecialties", "psychiatry_pain", "surgery_msk", "ent_eye_skin_allergy", "womens_childrens"]
  if (s.includes("cardio") || s.includes("pulmonolog") || s.includes("endocrinolog") || s.includes("gastroenterolog") || s.includes("rheumatolog") || s.includes("neurolog"))
    return ["primary_care", "internal_medicine_subspecialties", "psychiatry_pain"]
  if (s.includes("psychiatr") || s.includes("pain"))
    return ["primary_care", "internal_medicine_subspecialties", "surgery_msk"]
  if (s.includes("orthop") || s.includes("plastic") || s.includes("urolog") || s.includes("sports"))
    return ["primary_care", "psychiatry_pain", "ent_eye_skin_allergy"]
  if (s.includes("pediatric") || s.includes("ob-gyn") || s.includes("ob/gyn") || s.includes("obgyn") || s.includes("gynecolog"))
    return ["primary_care", "internal_medicine_subspecialties", "ent_eye_skin_allergy"]
  if (s.includes("ent") || s.includes("otolaryngolog") || s.includes("ophthalmolog") || s.includes("dermatolog") || s.includes("allerg") || s.includes("immunolog"))
    return ["primary_care", "womens_childrens", "internal_medicine_subspecialties"]
  return ["primary_care", "internal_medicine_subspecialties", "surgery_msk"]
}

// Mirror of the 19 physician specialties in lib/seo-data.ts (name field).
// Keep in sync when adding specialties to the marketplace.
const SPECIALTIES = [
  "Primary Care",
  "Weight Loss / Obesity Medicine",
  "Cardiology",
  "Pulmonology",
  "Endocrinology",
  "Gastroenterology",
  "Rheumatology",
  "Neurology",
  "Psychiatry",
  "Dermatology",
  "Ophthalmology",
  "Orthopedic Surgery",
  "Pain Management",
  "Pediatrics",
  "ENT (Otolaryngology)",
  "Allergy & Immunology",
  "Urology",
  "OB-GYN",
  "Sports Medicine",
  "Plastic Surgery",
  "Registered Dietitian",
  "Other physician specialty"
]

// Common offerings per specialty. Members click these to build their profile —
// the selected ones become their service tags and bio, and feed referral
// matching. Keyed by the specialty values above.
const OFFERINGS_BY_SPECIALTY: Record<string, string[]> = {
  "Primary Care": ["annual physicals", "chronic disease management", "preventive care", "vaccinations", "sick visits", "minor procedures", "wellness counseling", "lab work"],
  "Weight Loss / Obesity Medicine": ["medically supervised weight loss", "GLP-1 therapy", "metabolic testing", "body composition analysis", "nutrition counseling", "bariatric pre-op clearance", "meal planning", "InBody scans"],
  "Cardiology": ["echocardiography", "stress testing", "EKG", "Holter monitoring", "heart failure management", "hypertension management", "arrhythmia care", "cardiac catheterization"],
  "Pulmonology": ["pulmonary function testing", "sleep studies", "COPD management", "asthma management", "bronchoscopy", "sleep apnea treatment", "chronic cough evaluation"],
  "Endocrinology": ["diabetes management", "thyroid care", "hormone therapy", "osteoporosis care", "adrenal disorders", "insulin pump management", "PCOS care"],
  "Gastroenterology": ["colonoscopy", "upper endoscopy", "IBD management", "GERD treatment", "liver disease care", "hepatitis treatment", "fatty liver evaluation"],
  "Rheumatology": ["autoimmune disease management", "infusion therapy", "joint injections", "arthritis care", "lupus management", "gout treatment", "osteoporosis care"],
  "Neurology": ["headache & migraine care", "seizure management", "EEG", "EMG", "neuropathy treatment", "stroke follow-up", "movement disorders"],
  "Psychiatry": ["medication management", "depression treatment", "anxiety treatment", "ADHD care", "telepsychiatry", "bipolar care", "substance use treatment"],
  "Dermatology": ["skin cancer screening", "mole & lesion removal", "acne treatment", "cosmetic dermatology", "skin biopsies", "eczema & psoriasis care"],
  "Ophthalmology": ["comprehensive eye exams", "cataract surgery", "glaucoma management", "diabetic eye exams", "LASIK", "retinal care", "dry eye treatment"],
  "Orthopedic Surgery": ["joint replacement", "sports injury care", "fracture care", "arthroscopy", "spine care", "hand surgery", "joint injections"],
  "Pain Management": ["epidural injections", "nerve blocks", "spinal cord stimulation", "medication management", "joint injections", "radiofrequency ablation"],
  "Pediatrics": ["well-child visits", "vaccinations", "sick visits", "developmental screening", "adolescent care", "newborn care", "ADHD care"],
  "ENT (Otolaryngology)": ["sinus treatment", "hearing evaluations", "tonsillectomy", "sleep apnea surgery", "allergy testing", "voice & swallow care", "ear tubes"],
  "Allergy & Immunology": ["allergy testing", "immunotherapy", "asthma management", "food allergy care", "immune deficiency care", "eczema care", "drug allergy testing"],
  "Urology": ["prostate care", "kidney stone treatment", "vasectomy", "incontinence treatment", "men's health", "bladder care", "low testosterone treatment"],
  "OB-GYN": ["prenatal care", "well-woman exams", "contraception", "menopause management", "PCOS care", "gynecologic surgery", "fertility evaluation"],
  "Sports Medicine": ["injury evaluation", "concussion management", "joint injections", "regenerative medicine", "sports physicals", "rehab planning"],
  "Plastic Surgery": ["reconstructive surgery", "cosmetic surgery", "breast reconstruction", "skin cancer reconstruction", "hand surgery", "injectables & fillers"],
  "Registered Dietitian": ["medical nutrition therapy", "diabetes nutrition counseling", "weight management", "GLP-1 nutrition support", "meal planning", "bariatric nutrition", "GI & celiac nutrition", "renal nutrition", "sports nutrition", "prenatal nutrition"],
}
const DEFAULT_OFFERINGS = ["consultations", "diagnostics", "procedures", "chronic disease management", "preventive care", "follow-up care"]

function offeringsFor(specialty: string): string[] {
  return OFFERINGS_BY_SPECIALTY[specialty] || DEFAULT_OFFERINGS
}

interface FormData {
  practiceName: string
  specialty: string
  location: string
  address: string
  valueProp: string
  serviceTags: string[]
  partnerInterests: string[]
  referInterests: string[]
  email: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Step 2 mode: 'auto' = we recommend partners from their specialty; 'manual'
  // = they hand-pick. Defaults to auto so we do the thinking for them.
  const [partnerMode, setPartnerMode] = useState<"auto" | "manual">("auto")

  const [formData, setFormData] = useState<FormData>({
    practiceName: "",
    specialty: "",
    location: "",
    address: "",
    valueProp: "",
    serviceTags: [],
    partnerInterests: [],
    referInterests: [],
    email: ""
  })

  const [customOffering, setCustomOffering] = useState("")

  // Toggle a clicked offering chip on/off in the practice's service tags.
  const toggleOffering = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceTags: prev.serviceTags.includes(tag)
        ? prev.serviceTags.filter((t) => t !== tag)
        : [...prev.serviceTags, tag],
    }))
  }

  // Add a free-text offering the catalog doesn't list.
  const addCustomOffering = () => {
    const tag = customOffering.trim().toLowerCase()
    if (!tag) return
    setFormData((prev) => ({
      ...prev,
      serviceTags: prev.serviceTags.includes(tag) ? prev.serviceTags : [...prev.serviceTags, tag],
    }))
    setCustomOffering("")
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/onboarding")
    }
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }))
    }
  }, [user, authLoading, router, formData.email])

  const totalSteps = 3

  // In auto mode, keep the recommended partner categories in sync with the
  // chosen specialty so we always "do the thinking" for the user.
  useEffect(() => {
    if (step === 2 && partnerMode === "auto") {
      setFormData(prev => ({ ...prev, partnerInterests: recommendedCategoriesFor(prev.specialty) }))
    }
  }, [step, partnerMode])

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.practiceName && formData.specialty && formData.location && formData.address
      case 2:
        return formData.partnerInterests.length > 0
      case 3:
        return formData.referInterests.length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const togglePartnerInterest = (categoryId: string) => {
    setFormData(prev => {
      const current = prev.partnerInterests
      if (current.includes(categoryId)) {
        return { ...prev, partnerInterests: current.filter(c => c !== categoryId) }
      } else {
        return { ...prev, partnerInterests: [...current, categoryId] }
      }
    })
  }

  const toggleReferInterest = (categoryId: string) => {
    setFormData(prev => {
      const current = prev.referInterests
      if (current.includes(categoryId)) {
        return { ...prev, referInterests: current.filter(c => c !== categoryId) }
      } else {
        return { ...prev, referInterests: [...current, categoryId] }
      }
    })
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in first")
      router.push("/auth")
      return
    }

    setIsSubmitting(true)

    try {
      // Geocode the practice address to private coordinates for accurate map
      // centering. Best-effort: if it fails, we still save and fall back to
      // geocoding the public city label at discovery time.
      let coords: { lat: number; lng: number } | null = null
      if (formData.address.trim()) {
        try {
          const geoRes = await fetch(`/api/network/geocode?address=${encodeURIComponent(formData.address.trim())}`)
          if (geoRes.ok) {
            const geo = await geoRes.json()
            coords = geo.coordinates || null
          }
        } catch {
          /* keep coords null; discovery falls back to the city label */
        }
      }

      // Check if provider already exists
      const { data: existing } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (existing) {
        // Update existing provider
        const { error } = await supabase
          .from("providers")
          .update({
            practice_name: formData.practiceName,
            specialty: formData.specialty,
            location: formData.location,
            services_text: formData.serviceTags.join(", ") || null,
            value_prop: formData.valueProp || null,
            service_tags: formData.serviceTags,
            patients_i_want: formData.partnerInterests,
            patients_i_refer: formData.referInterests,
            email: formData.email,
            // Only overwrite stored coordinates when this geocode succeeded.
            ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
            network_opted_in: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        // If this practice was pre-seeded in the directory, claim that row
        // instead of creating a duplicate.
        const { data: seeded } = await supabase
          .from("providers")
          .select("id")
          .is("user_id", null)
          .eq("is_seeded", true)
          .ilike("practice_name", formData.practiceName.trim())
          .ilike("location", `%${formData.location.trim()}%`)
          .limit(1)
          .maybeSingle()

        const providerData = {
          user_id: user.id,
          practice_name: formData.practiceName,
          specialty: formData.specialty,
          location: formData.location,
          services_text: formData.serviceTags.join(", ") || null,
          value_prop: formData.valueProp || null,
          service_tags: formData.serviceTags,
          patients_i_want: formData.partnerInterests,
          patients_i_refer: formData.referInterests,
          email: formData.email,
          ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
          network_opted_in: true,
          updated_at: new Date().toISOString()
        }

        if (seeded) {
          // Claim the seeded profile.
          const { error } = await supabase
            .from("providers")
            .update({ ...providerData, claimed_at: new Date().toISOString() })
            .eq("id", seeded.id)

          if (error) throw error
        } else {
          // Create a brand-new provider.
          const { error } = await supabase.from("providers").insert({
            ...providerData,
            subscription_status: "trial"
          })

          if (error) throw error
        }
      }

      // Notify Grant that a provider completed their profile (qualified-lead
      // signal with specialty/location/interests). Best-effort: never block the
      // user's redirect on this.
      try {
        await fetch("/api/notify/onboarded", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            practiceName: formData.practiceName,
            specialty: formData.specialty,
            location: formData.location,
            patientsIWant: formData.partnerInterests,
            patientsIRefer: formData.referInterests,
            serviceTags: formData.serviceTags,
          }),
        })
      } catch {
        /* best-effort notification; ignore failures */
      }

      // Redirect to welcome experience
      router.push("/welcome")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-40 px-6 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Sleft Signals</span>
          </div>
          <span className="px-3 py-1.5 bg-slate-800 rounded-full text-sm text-slate-400">
            Step {step} of {totalSteps}
          </span>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Practice Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-blue-400" />
                </div>
                <h1 className="text-4xl font-black text-white mb-3">
                  Let's Get You Set Up
                </h1>
                <p className="text-xl text-slate-400">
                  Tell us about your practice so we can find the right partners
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Practice Name
                  </label>
                  <input
                    type="text"
                    value={formData.practiceName}
                    onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                    placeholder="e.g., Bay Cardiology Associates"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-lg placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    your specialty
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select your specialty</option>
                    {SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Practice address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., 123 Main St, Austin, TX 78701"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-lg placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    🔒 Private. Used only to place you on the partner map and measure
                    distances. Never shown on your public profile.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    City &amp; state shown publicly
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Austin, TX"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-lg placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    This is what other practices see on your directory listing — keep it
                    to a city, not your street address.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Select the services you offer{" "}
                    <span className="text-slate-500 font-normal">(these appear on your profile and help us match you)</span>
                  </label>

                  {!formData.specialty ? (
                    <p className="text-sm text-slate-500 bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
                      Pick your specialty above to see common services to choose from.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {offeringsFor(formData.specialty).map((tag) => {
                        const selected = formData.serviceTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleOffering(tag)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                              selected
                                ? "bg-blue-500/15 border-blue-500 text-blue-300"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            {selected ? "✓ " : "+ "}
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Add a service the catalog doesn't list */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={customOffering}
                      onChange={(e) => setCustomOffering(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCustomOffering()
                        }
                      }}
                      placeholder="Add another service..."
                      className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomOffering}
                      disabled={!customOffering.trim()}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>

                  {/* Custom-added services (not in the catalog) — removable */}
                  {formData.serviceTags.filter((t) => !offeringsFor(formData.specialty).includes(t)).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.serviceTags
                        .filter((t) => !offeringsFor(formData.specialty).includes(t))
                        .map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/25 text-blue-300 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => toggleOffering(tag)}
                              className="text-blue-400/70 hover:text-white"
                              aria-label={`Remove ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your one-line value proposition{" "}
                    <span className="text-slate-500 font-normal">(how referring doctors should describe you)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.valueProp}
                    onChange={(e) => setFormData({ ...formData, valueProp: e.target.value })}
                    placeholder="e.g., Medically supervised weight loss with GLP-1 therapy and metabolic testing"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-base placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Partner Interests */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-black text-white mb-3">
                  Let&apos;s Find Your Referral Partners
                </h1>
                <p className="text-xl text-slate-400">
                  We can recommend the right partners for your specialty, or you can pick them yourself.
                </p>
              </div>

              {/* Upfront choice: let us do the thinking, or choose manually */}
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPartnerMode("auto")}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                    partnerMode === "auto"
                      ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                  <Sparkles className={`w-7 h-7 mb-3 ${partnerMode === "auto" ? "text-emerald-400" : "text-slate-400"}`} />
                  <h3 className="font-bold text-lg text-white mb-1">Recommend partners for me</h3>
                  <p className="text-sm text-slate-400">
                    We&apos;ll pick the complementary specialties most likely to exchange referrals with your practice.
                  </p>
                </button>
                <button
                  onClick={() => setPartnerMode("manual")}
                  className={`text-left p-5 rounded-2xl border-2 transition-all ${
                    partnerMode === "manual"
                      ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <SlidersHorizontal className={`w-7 h-7 mb-3 ${partnerMode === "manual" ? "text-blue-400" : "text-slate-400"}`} />
                  <h3 className="font-bold text-lg text-white mb-1">I&apos;ll choose myself</h3>
                  <p className="text-sm text-slate-400">
                    Hand-pick the exact specialties you want referrals from.
                  </p>
                </button>
              </div>

              {partnerMode === "auto" ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <p className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Based on {formData.specialty || "your specialty"}, we&apos;ll connect you with:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.partnerInterests.map(id => {
                      const cat = PARTNER_CATEGORIES.find(c => c.id === id)
                      if (!cat) return null
                      return (
                        <span
                          key={id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-full text-sm font-medium"
                        >
                          <span>{cat.icon}</span>
                          {cat.label}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Looking for a specific referral relationship? Choose &quot;I&apos;ll choose myself&quot; to fine-tune.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {PARTNER_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => togglePartnerInterest(category.id)}
                      className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all ${
                        formData.partnerInterests.includes(category.id)
                          ? "bg-emerald-500/10 border-2 border-emerald-500 ring-2 ring-emerald-500/20"
                          : "bg-slate-900 border-2 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-3xl">{category.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-lg ${
                            formData.partnerInterests.includes(category.id) ? "text-emerald-400" : "text-white"
                          }`}>
                            {category.label}
                          </h3>
                          {formData.partnerInterests.includes(category.id) && (
                            <Check className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{category.description}</p>
                      </div>
                    </button>
                  ))}
                  {formData.partnerInterests.length > 0 && (
                    <p className="text-center text-sm text-slate-500">
                      {formData.partnerInterests.length} selected
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Refer-Out Interests */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="w-10 h-10 text-blue-400" />
                </div>
                <h1 className="text-4xl font-black text-white mb-3">
                  Who Do You Refer Patients To?
                </h1>
                <p className="text-xl text-slate-400">
                  This tells the directory which referrals you send out
                </p>
              </div>

              <div className="grid gap-4">
                {PARTNER_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleReferInterest(category.id)}
                    className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all ${
                      formData.referInterests.includes(category.id)
                        ? "bg-blue-500/10 border-2 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-900 border-2 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${
                          formData.referInterests.includes(category.id) ? "text-blue-400" : "text-white"
                        }`}>
                          {category.label}
                        </h3>
                        {formData.referInterests.includes(category.id) && (
                          <Check className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{category.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {formData.referInterests.length > 0 && (
                <p className="text-center text-sm text-slate-500">
                  {formData.referInterests.length} selected
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              step === 1
                ? "opacity-0 pointer-events-none"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                canProceed()
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:opacity-90 shadow-lg shadow-blue-500/25"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                canProceed() && !isSubmitting
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:opacity-90 shadow-lg shadow-blue-500/25"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
