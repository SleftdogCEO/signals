"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowRight, Sparkles, MapPin, Mail, Building2, CheckCircle, Loader2, ChevronDown } from "lucide-react"
import { ALL_SPECIALTIES } from "@/lib/adjacency-map"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    specialty: "",
    location: "",
    practiceName: "",
    email: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.specialty) {
      setError("Please select your specialty")
      return
    }

    if (!formData.location) {
      setError("Please enter your location")
      return
    }

    if (!formData.email) {
      setError("Please enter your email")
      return
    }

    setIsSubmitting(true)

    try {
      // Store form data in sessionStorage for after auth
      sessionStorage.setItem("snapshotRequest", JSON.stringify(formData))

      // Redirect to auth with return URL
      router.push("/auth?redirect=/dashboard/snapshot")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, 40, 0],
            y: [0, 40, 80, 0],
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/40 via-fuchsia-400/30 to-pink-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, -30, 0],
            y: [0, 60, 30, 0],
            scale: [1, 1.15, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/40 via-teal-400/30 to-emerald-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 1.2, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-violet-400/30 via-purple-400/20 to-indigo-300/10 rounded-full blur-3xl"
        />
      </div>

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Sleft Health</span>
        </motion.div>
      </nav>

      {/* Hero + Form */}
      <main className="relative z-20 px-6 lg:px-12 pt-8 lg:pt-12 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border border-teal-200 rounded-full shadow-sm mb-6">
                <span className="text-sm text-teal-700 font-semibold">Free Referral Intelligence Report</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-gray-900">Find referral partners </span>
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                  who share your patients
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Discover nearby practices with overlapping patient populations—providers who naturally refer to your specialty.
                <span className="font-semibold text-gray-900"> No cold calling. Just clarity.</span>
              </p>

              <div className="space-y-4">
                {[
                  "10-20 adjacent referral sources in your area",
                  "Ranked by proximity and prominence",
                  "Contact info and referral fit scores",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <form
                onSubmit={handleSubmit}
                className="relative z-30 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-200 p-8 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Get Your Free Snapshot
                </h2>
                <p className="text-gray-500 mb-6">
                  Takes 30 seconds. No credit card required.
                </p>

                <div className="space-y-5">
                  {/* Specialty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Your Specialty *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all appearance-none bg-white cursor-pointer"
                        required
                      >
                        <option value="">Select your specialty</option>
                        {ALL_SPECIALTIES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Austin, TX or 78701"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Practice Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Practice Name (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.practiceName}
                      onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                      placeholder="e.g., Summit Physical Therapy"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@practice.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-semibold text-lg rounded-xl hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 transition-all shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Show My Referral Opportunities
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Sign up to see your personalized referral snapshot.
                </p>
              </form>
            </motion.div>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
          >
            <p className="text-sm text-gray-500 font-medium mb-4">Built for healthcare providers</p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              {["Physical Therapy", "Orthopedics", "Chiropractic", "Primary Care", "Dentistry", "Mental Health"].map((item, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-sm text-gray-500">Sleft Health - Referral Intelligence for Healthcare</span>
        </div>
      </footer>
    </div>
  )
}
