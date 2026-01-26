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
  Sparkles
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simplified partner categories - broad, easy to understand
const PARTNER_CATEGORIES = [
  {
    id: "primary_care",
    label: "Primary Care",
    description: "Family medicine, internal medicine, pediatrics",
    icon: "🏥"
  },
  {
    id: "specialists",
    label: "Medical Specialists",
    description: "Cardiology, dermatology, gastroenterology, etc.",
    icon: "🩺"
  },
  {
    id: "mental_health",
    label: "Mental Health",
    description: "Psychiatry, psychology, counseling, therapy",
    icon: "🧠"
  },
  {
    id: "physical_rehab",
    label: "Physical & Rehab",
    description: "PT, OT, chiropractic, sports medicine",
    icon: "💪"
  },
  {
    id: "dental_vision",
    label: "Dental & Vision",
    description: "Dentistry, orthodontics, optometry, ophthalmology",
    icon: "😁"
  },
  {
    id: "wellness_aesthetic",
    label: "Wellness & Aesthetic",
    description: "Med spas, functional medicine, nutrition, acupuncture",
    icon: "✨"
  }
]

const SPECIALTIES = [
  "Primary Care",
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Physical Therapy",
  "Chiropractic",
  "Orthopedics",
  "Pain Management",
  "Dermatology",
  "Psychiatry",
  "Psychology",
  "Dentistry",
  "Optometry/Ophthalmology",
  "Med Spa",
  "Plastic Surgery",
  "Cardiology",
  "OB/GYN",
  "Urgent Care",
  "Functional Medicine",
  "Other"
]

interface FormData {
  practiceName: string
  specialty: string
  location: string
  partnerInterests: string[]
  email: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    practiceName: "",
    specialty: "",
    location: "",
    partnerInterests: [],
    email: ""
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/onboarding")
    }
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }))
    }
  }, [user, authLoading, router, formData.email])

  const totalSteps = 2

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.practiceName && formData.specialty && formData.location
      case 2:
        return formData.partnerInterests.length > 0
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

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in first")
      router.push("/auth")
      return
    }

    setIsSubmitting(true)

    try {
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
            patients_i_want: formData.partnerInterests,
            email: formData.email,
            network_opted_in: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        // Create new provider
        const { error } = await supabase.from("providers").insert({
          user_id: user.id,
          practice_name: formData.practiceName,
          specialty: formData.specialty,
          location: formData.location,
          patients_i_want: formData.partnerInterests,
          patients_i_refer: [],
          email: formData.email,
          subscription_status: "trial",
          network_opted_in: true
        })

        if (error) throw error
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

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
            <span className="text-lg font-bold text-white">Sleft Health</span>
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
                    placeholder="e.g., Summit Physical Therapy"
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
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Austin, TX"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-lg placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
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
                  Who Do You Want to Connect With?
                </h1>
                <p className="text-xl text-slate-400">
                  We'll help you build relationships with these providers
                </p>
              </div>

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
              </div>

              {formData.partnerInterests.length > 0 && (
                <p className="text-center text-sm text-slate-500">
                  {formData.partnerInterests.length} selected
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
