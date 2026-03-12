import Link from "next/link"
import {
  ArrowRight,
  Zap,
  DollarSign,
  Search,
  MapPin,
  Handshake,
  XCircle,
  CheckCircle,
} from "lucide-react"
import { specialties } from "@/lib/seo-data"

const features = [
  {
    icon: Search,
    title: "We Find Them For You",
    description: "We scrape and verify local providers in complementary specialties. You just show up and connect.",
    color: "blue" as const,
  },
  {
    icon: MapPin,
    title: "Hyper-Local Matches",
    description: "Providers within 5-10 miles of your practice. Same community, same patients, easy referrals.",
    color: "emerald" as const,
  },
  {
    icon: Handshake,
    title: "Mutual-Fit Only",
    description: "A chiropractor needs PTs. A PT needs orthopedic surgeons. We match specialties that actually refer to each other.",
    color: "amber" as const,
  },
]

const partnerships = [
  { from: "Chiropractor", to: "Physical Therapist", specSlug: "chiropractors" },
  { from: "Dentist", to: "Orthodontist", specSlug: "dentists" },
  { from: "Primary Care", to: "Specialist", specSlug: "primary-care" },
  { from: "Med Spa", to: "Dermatologist", specSlug: "med-spas" },
  { from: "Mental Health", to: "Primary Care", specSlug: "mental-health" },
  { from: "Orthopedic", to: "Pain Management", specSlug: "orthopedic-surgeons" },
]

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400" },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sleft Signals</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Blog
          </Link>
          <Link
            href="/auth"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth?signup=true"
            className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-20 px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
              <DollarSign className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 font-medium">Stop paying agencies $3k/month for garbage leads</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
              Your Best Referrals Are
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Down The Street
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              We find local healthcare providers who can send you patients.
              No ads. No agencies. Just partnerships with your neighbors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-blue-500/25"
              >
                See Who&apos;s Near You
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center gap-2 px-8 py-4 text-slate-400 hover:text-white font-medium transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>

          {/* The Problem */}
          <div className="max-w-4xl mx-auto mb-32">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                The Problem With Healthcare Marketing
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    What Agencies Do
                  </h3>
                  <ul className="space-y-3 text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      Charge $2-5k/month for Facebook ads
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      Send you tire-kickers who ghost
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      Zero integration with your community
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      You&apos;re competing with every practice in your city
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    What Actually Works
                  </h3>
                  <ul className="space-y-3 text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Referrals from other providers
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Patients who already trust someone
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Local relationships that compound
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      Zero ad spend required
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-700 text-center">
                <p className="text-xl text-white font-medium">
                  The orthopedic surgeon 2 miles away could send you 10 patients a month.
                  <span className="text-slate-400 block mt-1">Do you even know their name?</span>
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div id="how-it-works" className="mb-32 scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                We Do The Work For You
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                No networking events. No cold calls. We find the providers, you make the connection.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const colors = colorMap[feature.color]
                return (
                  <div
                    key={index}
                    className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-900/80"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${colors.bg}`}>
                      <Icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Partnership Examples */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Referrals That Make Sense
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                We match specialties that naturally refer to each other. Your patients become their patients, and vice versa.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {partnerships.map((p, i) => (
                <Link
                  key={i}
                  href={`/find-referral-partners/${p.specSlug}`}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex-1 text-right">
                    <span className="text-white font-medium">{p.from}</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-medium">{p.to}</span>
                  </div>
                </Link>
              ))}
            </div>

            <p className="text-center text-slate-500 mt-6">
              And dozens more specialty combinations
            </p>
          </div>

          {/* CTA */}
          <div className="mb-32">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                See Who&apos;s In Your Area
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
                Enter your practice details and we&apos;ll show you providers nearby who could become referral partners.
              </p>
              <Link
                href="/auth?signup=true"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-semibold text-lg rounded-xl hover:bg-slate-100 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                Free to join. No credit card required.
              </p>
            </div>
          </div>

          {/* Bottom line */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
              Stop paying agencies to burn your budget.
              <span className="block text-slate-400 mt-2">
                Start building relationships with the providers next door.
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Find Referral Partners - SEO internal links */}
      <section className="relative z-10 px-6 lg:px-12 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Find Referral Partners by Specialty</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {specialties.map((s) => (
              <Link
                key={s.slug}
                href={`/find-referral-partners/${s.slug}`}
                className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium"
              >
                {s.plural}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Sleft Signals</span>
          </div>
          <span className="text-sm text-slate-500">Local referral intelligence for healthcare practices</span>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Sleft Signals",
            url: "https://sleftsignals.com",
            description: "Find healthcare referral partners who share your patient population. Get a free snapshot of nearby practices.",
            serviceType: "Healthcare Referral Intelligence",
          }),
        }}
      />
    </div>
  )
}
