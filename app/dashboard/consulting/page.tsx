"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Stethoscope,
  ArrowLeft,
  Zap,
  Globe,
  Bot,
  BarChart3,
  MessageSquare,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Code,
  Megaphone,
  Users,
  Clock,
  Shield,
  Star,
  Send,
  Loader2,
  Phone,
  Mail,
  Building2,
  Target,
  TrendingUp,
  Cpu,
  Workflow,
  FileText,
  Video
} from "lucide-react"
import { toast } from "sonner"

const SERVICES = [
  {
    icon: Globe,
    title: "Custom Practice Websites",
    description: "High-converting websites designed specifically for healthcare. SEO-optimized, HIPAA-aware, and built to turn visitors into patients.",
    features: ["Mobile-first design", "Online booking integration", "Patient portal ready", "Lightning fast load times"],
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    icon: Bot,
    title: "AI Patient Engagement",
    description: "24/7 AI assistants that answer patient questions, schedule appointments, and handle intake — without adding staff.",
    features: ["Custom trained on your services", "Integrates with your EHR", "Multi-language support", "HIPAA compliant"],
    gradient: "from-violet-500 to-purple-400"
  },
  {
    icon: Workflow,
    title: "Automated Patient Funnels",
    description: "Turn website visitors into booked appointments with intelligent lead capture, nurture sequences, and conversion optimization.",
    features: ["Landing page creation", "Email/SMS automation", "Lead scoring", "Analytics dashboard"],
    gradient: "from-emerald-500 to-teal-400"
  },
  {
    icon: Megaphone,
    title: "Healthcare Marketing Systems",
    description: "Done-for-you marketing campaigns that actually work. Google Ads, social media, and content strategies tailored to your specialty.",
    features: ["Google Ads management", "Social media content", "Review generation", "Local SEO"],
    gradient: "from-amber-500 to-orange-400"
  },
  {
    icon: FileText,
    title: "AI Documentation & Scribing",
    description: "Reduce charting time by 70% with AI-powered documentation. Integrates with your workflow, learns your style.",
    features: ["Voice-to-notes", "Template customization", "EHR integration", "SOAP note generation"],
    gradient: "from-pink-500 to-rose-400"
  },
  {
    icon: BarChart3,
    title: "Practice Analytics & Insights",
    description: "Real-time dashboards showing exactly where your patients come from, what's working, and where to invest next.",
    features: ["Patient acquisition tracking", "ROI by marketing channel", "Predictive analytics", "Custom reports"],
    gradient: "from-cyan-500 to-blue-400"
  }
]

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery Call",
    description: "We learn about your practice, goals, and current challenges. No sales pitch — just understanding."
  },
  {
    step: "02",
    title: "Custom Strategy",
    description: "Our team designs a solution tailored to your specialty, market, and budget. You approve before we build."
  },
  {
    step: "03",
    title: "Build & Launch",
    description: "We handle everything — development, testing, integration. You focus on patients."
  },
  {
    step: "04",
    title: "Optimize & Scale",
    description: "Ongoing support, analytics, and optimization. We're your long-term growth partner."
  }
]

const TESTIMONIALS = [
  {
    quote: "They built us an AI booking system that increased our new patient appointments by 40% in the first month.",
    author: "Dr. Sarah Chen",
    practice: "Integrative Medicine Center",
    rating: 5
  },
  {
    quote: "The website they created finally represents the quality of care we provide. And it actually converts.",
    author: "Dr. Michael Torres",
    practice: "Advanced Physical Therapy",
    rating: 5
  },
  {
    quote: "Their marketing system paid for itself in week two. Now it's pure profit.",
    author: "Dr. Emily Watson",
    practice: "Renewal Med Spa",
    rating: 5
  }
]

export default function ConsultingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    practiceName: "",
    specialty: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)
    toast.success("Request submitted! We'll be in touch within 24 hours.")
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard/network/hub" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Hub
            </Link>
            <a
              href="https://calendly.com/sleft"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Calendar className="w-4 h-4" />
              Book a Call
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">AI-Powered Practice Growth</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 leading-[1.1]">
              Your Practice Deserves
              <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                A Tech Team
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              We're a team of AI engineers, healthcare marketers, and developers who build the tools that
              help practices grow. Websites, funnels, automation, AI — we build it all.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://calendly.com/sleft"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-amber-500/25"
              >
                Schedule a Free Strategy Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#services"
                className="flex items-center gap-2 px-8 py-4 text-slate-400 hover:text-white font-medium transition-colors"
              >
                See What We Build
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-sm text-slate-500">Practices Served</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">3x</p>
                <p className="text-sm text-slate-500">Avg. ROI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2 Weeks</p>
                <p className="text-sm text-slate-500">Avg. Delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-sm text-slate-500">HIPAA Compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              Everything Your Practice Needs to Grow
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From patient-facing websites to AI-powered automation, we build the systems that let you focus on care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-slate-400 mb-5 leading-relaxed">{service.description}</p>

                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-28 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              How We Work
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Simple, transparent, and designed around your schedule.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              What Practice Owners Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.author}</p>
                  <p className="text-sm text-slate-500">{testimonial.practice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section id="request" className="py-20 lg:py-28 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              Tell Us What You Need
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Have an idea for a tool, website, or system? We'll build it. Fill out this form and we'll get back to you within 24 hours.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Request Submitted!</h3>
              <p className="text-slate-400 mb-6">
                Thanks for reaching out. Our team will review your request and get back to you within 24 hours.
              </p>
              <Link
                href="/dashboard/network/hub"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Hub
              </Link>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="john@practice.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Practice Name</label>
                  <input
                    type="text"
                    value={formData.practiceName}
                    onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Smith Family Practice"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Type *</label>
                  <select
                    required
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select a project type</option>
                    <option value="website">Website / Landing Pages</option>
                    <option value="ai_assistant">AI Assistant / Chatbot</option>
                    <option value="marketing">Marketing Automation</option>
                    <option value="funnel">Patient Acquisition Funnel</option>
                    <option value="integration">Software Integration</option>
                    <option value="custom">Custom Tool / System</option>
                    <option value="other">Other / Not Sure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Budget Range</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="under_5k">Under $5,000</option>
                    <option value="5k_15k">$5,000 - $15,000</option>
                    <option value="15k_30k">$15,000 - $30,000</option>
                    <option value="30k_plus">$30,000+</option>
                    <option value="ongoing">Ongoing Monthly Retainer</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tell us about your project *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="Describe what you're looking to build, any problems you're trying to solve, or ideas you have..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 mt-4">
                Or schedule a call directly:{" "}
                <a
                  href="https://calendly.com/sleft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300"
                >
                  calendly.com/sleft
                </a>
              </p>
            </motion.form>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
            Ready to Grow Your Practice?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
            Let's talk about what's possible. No obligation, no pressure — just a conversation about your practice.
          </p>
          <a
            href="https://calendly.com/sleft"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-bold text-lg rounded-xl hover:bg-slate-100 transition-colors"
          >
            Book Your Free Strategy Call
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">Sleft Health AI</span>
            </div>
            <p className="text-sm text-slate-500">
              AI-powered solutions for healthcare practice growth
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
