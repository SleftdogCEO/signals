"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Building2, MapPin, Users, UserPlus, Check, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SPECIALTIES = [
  "Primary Care",
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Orthopedic Surgery",
  "Physical Therapy",
  "Occupational Therapy",
  "Chiropractic",
  "Sports Medicine",
  "Pain Management",
  "Neurology",
  "Cardiology",
  "Dermatology",
  "Psychiatry",
  "Psychology",
  "Counseling",
  "Dentistry",
  "Orthodontics",
  "Oral Surgery",
  "Optometry",
  "Ophthalmology",
  "OB/GYN",
  "Urology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Rheumatology",
  "Plastic Surgery",
  "ENT",
  "Podiatry",
  "Acupuncture",
  "Massage Therapy",
  "Nutrition/Dietetics",
  "Urgent Care",
  "Other"
]

interface FormData {
  practiceName: string
  specialty: string
  location: string
  patientsIWant: string[]
  patientsIRefer: string[]
  phone: string
  email: string
  website: string
  bio: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    practiceName: "",
    specialty: "",
    location: "",
    patientsIWant: [],
    patientsIRefer: [],
    phone: "",
    email: user?.email || "",
    website: "",
    bio: ""
  })

  const totalSteps = 4

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.practiceName && formData.specialty && formData.location
      case 2:
        return formData.patientsIWant.length > 0
      case 3:
        return formData.patientsIRefer.length > 0
      case 4:
        return formData.email
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

  const toggleSpecialty = (specialty: string, field: "patientsIWant" | "patientsIRefer") => {
    setFormData(prev => {
      const current = prev[field]
      if (current.includes(specialty)) {
        return { ...prev, [field]: current.filter(s => s !== specialty) }
      } else {
        return { ...prev, [field]: [...current, specialty] }
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
      const { error } = await supabase.from("providers").insert({
        user_id: user.id,
        practice_name: formData.practiceName,
        specialty: formData.specialty,
        location: formData.location,
        patients_i_want: formData.patientsIWant,
        patients_i_refer: formData.patientsIRefer,
        phone: formData.phone || null,
        email: formData.email,
        website: formData.website || null,
        bio: formData.bio || null,
        subscription_status: "trial"
      })

      if (error) {
        console.error("Error creating provider:", error)
        toast.error("Failed to create profile. Please try again.")
        return
      }

      toast.success("Welcome to the network!")
      router.push("/dashboard/network")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Step {step} of {totalSteps}
          </motion.div>
        </div>

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
                <Building2 className="w-12 h-12 text-violet-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Tell us about your practice
                </h1>
                <p className="text-gray-600">
                  This helps us match you with the right referral partners
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Practice Name
                  </label>
                  <input
                    type="text"
                    value={formData.practiceName}
                    onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                    placeholder="e.g., Summit Physical Therapy"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Specialty
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  >
                    <option value="">Select your specialty</option>
                    {SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Austin, TX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Patients I Want */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <UserPlus className="w-12 h-12 text-violet-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  What patients do you want more of?
                </h1>
                <p className="text-gray-600">
                  Select the specialties you want referrals FROM
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALTIES.filter(s => s !== formData.specialty).map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty, "patientsIWant")}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.patientsIWant.includes(specialty)
                        ? "border-violet-600 bg-violet-50 text-violet-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {formData.patientsIWant.includes(specialty) && (
                      <Check className="w-4 h-4 inline mr-1" />
                    )}
                    {specialty}
                  </button>
                ))}
              </div>

              {formData.patientsIWant.length > 0 && (
                <p className="text-center text-sm text-gray-500">
                  {formData.patientsIWant.length} selected
                </p>
              )}
            </motion.div>
          )}

          {/* Step 3: Patients I Refer */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <Users className="w-12 h-12 text-violet-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  What patients do you typically refer out?
                </h1>
                <p className="text-gray-600">
                  Select the specialties you refer patients TO
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALTIES.filter(s => s !== formData.specialty).map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty, "patientsIRefer")}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.patientsIRefer.includes(specialty)
                        ? "border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {formData.patientsIRefer.includes(specialty) && (
                      <Check className="w-4 h-4 inline mr-1" />
                    )}
                    {specialty}
                  </button>
                ))}
              </div>

              {formData.patientsIRefer.length > 0 && (
                <p className="text-center text-sm text-gray-500">
                  {formData.patientsIRefer.length} selected
                </p>
              )}
            </motion.div>
          )}

          {/* Step 4: Contact Info */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-violet-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Almost done! Add your contact info
                </h1>
                <p className="text-gray-600">
                  This is shared with providers who connect with you
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@practice.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourpractice.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Bio (optional)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell other providers about your practice and ideal referral partnerships..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-100">
                <h3 className="font-semibold text-gray-900 mb-3">Your Profile Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Practice:</span> {formData.practiceName}</p>
                  <p><span className="text-gray-500">Specialty:</span> {formData.specialty}</p>
                  <p><span className="text-gray-500">Location:</span> {formData.location}</p>
                  <p><span className="text-gray-500">Want referrals from:</span> {formData.patientsIWant.join(", ")}</p>
                  <p><span className="text-gray-500">Refer patients to:</span> {formData.patientsIRefer.join(", ")}</p>
                </div>
              </div>
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
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                canProceed()
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                canProceed() && !isSubmitting
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  Join the Network
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
