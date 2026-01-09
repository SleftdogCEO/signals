"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Star,
  Loader2,
  ArrowLeft,
  Check,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  Building2,
  DollarSign,
  Megaphone,
  Users,
  Zap,
  Phone,
  Calendar,
  MessageSquare,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const REVIEW_TYPES = [
  { id: 'ehr_software', label: 'EHR Software', icon: Cpu, description: 'Electronic health records systems' },
  { id: 'practice_management', label: 'Practice Management', icon: Building2, description: 'Practice operations software' },
  { id: 'payment_processing', label: 'Payment Processing', icon: DollarSign, description: 'Payment & billing solutions' },
  { id: 'marketing_service', label: 'Marketing Service', icon: Megaphone, description: 'Marketing agencies & tools' },
  { id: 'billing_service', label: 'Billing Service', icon: DollarSign, description: 'Medical billing companies' },
  { id: 'telehealth', label: 'Telehealth', icon: Users, description: 'Virtual care platforms' },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar, description: 'Appointment scheduling software' },
  { id: 'patient_communication', label: 'Patient Communication', icon: MessageSquare, description: 'Patient messaging & engagement' },
  { id: 'ai_tool', label: 'AI Tool', icon: Zap, description: 'AI-powered healthcare tools' },
  { id: 'other', label: 'Other', icon: HelpCircle, description: 'Other software or services' },
]

export default function NewReviewPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Form state
  const [step, setStep] = useState(1)
  const [reviewType, setReviewType] = useState('')
  const [productName, setProductName] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [overallRating, setOverallRating] = useState(0)
  const [easeOfUse, setEaseOfUse] = useState(0)
  const [valueForMoney, setValueForMoney] = useState(0)
  const [customerSupport, setCustomerSupport] = useState(0)
  const [title, setTitle] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/network/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          reviewType,
          productName,
          vendorName: vendorName || null,
          overallRating,
          easeOfUse: easeOfUse || null,
          valueForMoney: valueForMoney || null,
          customerSupport: customerSupport || null,
          title,
          pros: pros || null,
          cons: cons || null,
          reviewContent,
          wouldRecommend: wouldRecommend ?? true
        })
      })

      if (res.ok) {
        toast.success('Review submitted! Thanks for sharing your experience.')
        router.push('/dashboard/network/hub?tab=reviews')
      } else {
        const { error } = await res.json()
        toast.error(error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!reviewType
      case 2:
        return !!productName.trim() && overallRating > 0
      case 3:
        return !!title.trim() && !!reviewContent.trim() && wouldRecommend !== null
      default:
        return false
    }
  }

  const RatingStars = ({
    value,
    onChange,
    label
  }: {
    value: number
    onChange: (n: number) => void
    label: string
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600 hover:text-slate-500'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Gradient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard/network/hub"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Network</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Step {step} of 3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Write a Review</h1>
          <p className="text-slate-400">Help other physicians make informed decisions</p>
        </motion.div>

        {/* Step 1: Select Type */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-white">What are you reviewing?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REVIEW_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = reviewType === type.id
                return (
                  <button
                    key={type.id}
                    onClick={() => setReviewType(type.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-violet-500/20 border-violet-500 text-white'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-violet-500/20' : 'bg-slate-800'}`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-400' : 'text-slate-400'}`} />
                    </div>
                    <span className="font-medium text-sm">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Product & Ratings */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-white">Product Details & Ratings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product/Service Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Epic, Stripe, Jane App"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vendor/Company Name (optional)
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g., Epic Systems, Stripe Inc."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-6">
              <RatingStars
                value={overallRating}
                onChange={setOverallRating}
                label="Overall Rating *"
              />

              <div className="grid md:grid-cols-3 gap-6">
                <RatingStars
                  value={easeOfUse}
                  onChange={setEaseOfUse}
                  label="Ease of Use"
                />
                <RatingStars
                  value={valueForMoney}
                  onChange={setValueForMoney}
                  label="Value for Money"
                />
                <RatingStars
                  value={customerSupport}
                  onChange={setCustomerSupport}
                  label="Customer Support"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review Content */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-white">Your Review</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience in a headline"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-2">
                  Pros
                </label>
                <textarea
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  placeholder="What did you like?"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-400 mb-2">
                  Cons
                </label>
                <textarea
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  placeholder="What could be better?"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Review *
              </label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Share your detailed experience. What should other physicians know?"
                rows={5}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Would you recommend this to other physicians? *
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                    wouldRecommend === true
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  Yes, I recommend
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                    wouldRecommend === false
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  No, I don&apos;t recommend
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-800">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit Review
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
