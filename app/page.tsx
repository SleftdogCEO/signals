import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  ArrowLeftRight,
  Zap,
  Search,
  MapPin,
  Handshake,
  Activity,
  Users,
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
  { from: "Primary Care", to: "Cardiology", specSlug: "cardiologists", bi: true },
  { from: "Primary Care", to: "Endocrinology", specSlug: "endocrinologists", bi: true },
  { from: "Orthopedic Surgery", to: "Pain Management", specSlug: "orthopedic-surgeons", bi: true },
  { from: "Plastic Surgery", to: "Dermatology", specSlug: "dermatologists", bi: true },
  { from: "Primary Care", to: "Psychiatry", specSlug: "psychiatrists", bi: false },
  { from: "Pediatrics", to: "Allergy & Immunology", specSlug: "allergists", bi: false },
]

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400" },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-[10%] w-[600px] h-[600px] bg-blue-500/[0.09] rounded-full blur-[160px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[140px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-[10%] left-[30%] w-[700px] h-[700px] bg-blue-600/[0.05] rounded-full blur-[160px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute bottom-[-150px] right-[20%] w-[450px] h-[450px] bg-amber-500/[0.05] rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "14s" }} />
      </div>
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

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
            href="/referral-lookup"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Find Partners
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

      {/* Hero - Two Column Layout */}
      <main className="relative z-20 px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-24">
            {/* Left - Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/[0.08] border border-blue-500/30 rounded-full mb-6 backdrop-blur-sm">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Referral intelligence for physician practices</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
                <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
                  Your Best Referrals Are Down The Street.
                </span>
                <span className="block text-2xl md:text-3xl lg:text-4xl font-bold text-slate-300 mt-3">
                  We Help You Find Them.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 font-medium">
                We match your practice with <span className="text-blue-400">complementary physicians in your zip code</span> who can send you patients. No ads. No agencies. Just the physician referral network you should have built years ago.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/referral-lookup"
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-blue-400 hover:to-cyan-400 transition-all shadow-xl shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                >
                  See Your Referral Partners
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-400 border border-white/10 bg-white/[0.03] rounded-lg backdrop-blur-sm hover:border-blue-500/20 hover:bg-blue-500/[0.04] hover:text-white transition-all"
                >
                  How It Works
                </Link>
              </div>
            </div>

            {/* Right - Founder Image */}
            <div className="relative flex-shrink-0">
              {/* Emerald accent sweep — distinguishes right column from blue left side */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/[0.12] rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-8 w-60 h-60 bg-cyan-500/[0.10] rounded-full blur-[70px] pointer-events-none" />
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-cyan-500/30 to-blue-500/30 blur-lg" />
                <Image
                  src="/grant-headshot.png"
                  alt="Grant Denmark, founder of Sleft Signals"
                  width={320}
                  height={320}
                  className="relative h-64 w-64 md:h-80 md:w-80 rounded-2xl object-cover object-top border-2 border-white/10 shadow-2xl"
                  priority
                />
                {/* Badge overlay */}
                <div className="absolute -bottom-3 -right-3 rounded-xl border border-white/10 bg-slate-900/90 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs font-bold text-blue-400">Grant Denmark</p>
                  <p className="text-xs text-slate-400">Resident Physician + Agentic Engineer</p>
                </div>
              </div>
            </div>
          </div>

          {/* The Problem - Condensed */}
          <div className="max-w-4xl mx-auto mb-32">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 md:p-10">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Agencies Burn Your Budget. Referrals Compound.
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/[0.04] border border-red-500/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-red-400 mb-3">Marketing Agencies</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    $2-5k/month for Facebook ads that send tire-kickers who ghost after the first visit. Zero integration with your local community. You compete with every practice in your city.
                  </p>
                </div>
                <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-emerald-400 mb-3">Provider Referrals</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Patients arrive pre-qualified and trusting. The ortho 2 miles away sends you 10 post-ops a month. The PCP down the street refers every MSK complaint. Zero ad spend. Relationships that compound.
                  </p>
                </div>
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

          {/* Partnership Network Visual */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Referrals That Make Sense
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                We match specialties that naturally refer to each other. Your patients become their patients, and vice versa.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/80 p-8 md:p-12 overflow-hidden">
              {/* Network SVG backdrop */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
                preserveAspectRatio="none"
                viewBox="0 0 800 500"
              >
                <defs>
                  <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0" />
                    <stop offset="50%" stopColor="rgb(34 211 238)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Background dots */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = (i * 137) % 800
                  const y = (i * 89) % 500
                  return <circle key={i} cx={x} cy={y} r="1.5" fill="rgb(148 163 184)" opacity="0.15" />
                })}
                {/* Connecting lines */}
                <path d="M 80 100 Q 400 50 720 120" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="4 6">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="6s" repeatCount="indefinite" />
                </path>
                <path d="M 80 250 Q 400 200 720 280" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="4 6">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="8s" repeatCount="indefinite" />
                </path>
                <path d="M 80 400 Q 400 450 720 380" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="4 6">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="7s" repeatCount="indefinite" />
                </path>
                {/* Glow nodes */}
                <circle cx="120" cy="120" r="60" fill="url(#nodeGrad)" />
                <circle cx="680" cy="380" r="60" fill="url(#nodeGrad)" />
              </svg>

              {/* Partnership pills */}
              <div className="relative grid sm:grid-cols-2 gap-4">
                {partnerships.map((p, i) => {
                  const accent = ["blue", "emerald", "amber", "blue", "emerald", "amber"][i % 6]
                  const dotClass =
                    accent === "blue"
                      ? "bg-blue-400"
                      : accent === "emerald"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                  const arrowBg =
                    accent === "blue"
                      ? "bg-blue-500/20 text-blue-400"
                      : accent === "emerald"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                  return (
                    <Link
                      key={i}
                      href={`/find-referral-partners/${p.specSlug}`}
                      className="group relative bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl px-5 py-4 flex items-center gap-3 hover:border-blue-500/50 hover:-translate-y-0.5 transition-all"
                    >
                      <div className={`w-2 h-2 rounded-full ${dotClass} shadow-[0_0_12px_currentColor] flex-shrink-0`} />
                      <span className="text-white font-medium text-sm md:text-base">{p.from}</span>
                      <div className="flex-1 mx-2 border-t border-dashed border-slate-700 group-hover:border-blue-500/40 transition-colors" />
                      <div className={`w-7 h-7 ${arrowBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {p.bi ? (
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-white font-medium text-sm md:text-base">{p.to}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="relative text-center mt-8">
                <Link
                  href="/find-referral-partners"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Browse all {specialties.length} physician specialties across 35+ cities
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Referral Lookup CTA */}
          <div className="mb-32">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Free Tool</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    See Your Referral Partners Instantly
                  </h2>
                  <p className="text-lg text-slate-400 mb-8 max-w-xl">
                    Enter your specialty and zip code. We show you every complementary physician within 10 miles who could be sending you patients right now.
                  </p>
                  <Link
                    href="/referral-lookup"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-semibold text-lg rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Find My Referral Partners
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-sm text-slate-500 mt-4">
                    No signup required. Results in seconds.
                  </p>
                </div>
                <div className="flex-shrink-0 hidden md:block">
                  <div className="w-64 h-64 bg-slate-900/80 border border-slate-700 rounded-2xl p-6 flex flex-col gap-3">
                    <div className="text-xs text-slate-500 font-mono mb-2">SAMPLE RESULTS</div>
                    {[
                      { name: "Bay Area Cardiology", score: 97 },
                      { name: "Coastal Family Medicine", score: 94 },
                      { name: "Tampa Endocrinology", score: 91 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-300 truncate">{item.name}</span>
                        <span className="text-xs font-bold text-emerald-400 ml-2">{item.score}%</span>
                      </div>
                    ))}
                    <div className="text-xs text-slate-600 mt-auto text-center">+ 12 more matches</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
              The physicians next door are sending patients to <span className="text-slate-500 line-through">someone</span>.
              <span className="block text-slate-300 mt-2">
                Make sure that someone is <span className="text-emerald-400 font-bold">you</span>.
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Find Referral Partners - SEO internal links */}
      <section className="relative z-10 px-6 lg:px-12 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Find Physician Referral Partners by Specialty</h2>
            <Link href="/find-referral-partners" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              View all specialties & cities →
            </Link>
          </div>
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
          <span className="text-sm text-slate-500">Local referral intelligence for physician practices</span>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://sleftsignals.com/#organization",
                name: "Sleft Signals",
                url: "https://sleftsignals.com",
                logo: "https://sleftsignals.com/logo.png",
                description:
                  "Physician referral partner matching. Find physicians in complementary specialties who share your patient population, within a 5-10 mile radius of your practice.",
                founder: {
                  "@type": "Person",
                  name: "Grant Denmark",
                  jobTitle: "Resident Physician & Agentic Engineer",
                },
                areaServed: { "@type": "Country", name: "United States" },
                sameAs: ["https://sleftsignals.com"],
              },
              {
                "@type": "WebSite",
                "@id": "https://sleftsignals.com/#website",
                url: "https://sleftsignals.com",
                name: "Sleft Signals",
                description: "Healthcare Referral Partner Matching",
                publisher: { "@id": "https://sleftsignals.com/#organization" },
                inLanguage: "en-US",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://sleftsignals.com/find-referral-partners/{search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Service",
                "@id": "https://sleftsignals.com/#service",
                name: "Physician Referral Partner Matching",
                serviceType: "Physician Referral Intelligence",
                provider: { "@id": "https://sleftsignals.com/#organization" },
                areaServed: { "@type": "Country", name: "United States" },
                audience: {
                  "@type": "Audience",
                  audienceType: "Physicians",
                },
                description:
                  "Find and connect with complementary physicians in your local area. Provider density mapping, referral corridor analysis, and mutual-fit matching for physician practices across 19 specialties and 35 metros.",
                offers: {
                  "@type": "Offer",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
              },
              {
                "@type": "FAQPage",
                "@id": "https://sleftsignals.com/#faq",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How does Sleft Signals find physician referral partners?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "We scrape and verify local physicians in complementary specialties, then match them based on mutual-fit referral patterns drawn from CMS shared patient data and NPI registry analysis. Matches are filtered to a 5-10 mile radius of your practice so referrals stay local.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Which physician specialties does Sleft Signals cover?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "19 physician specialties: primary care, cardiology, pulmonology, endocrinology, gastroenterology, rheumatology, neurology, psychiatry, dermatology, ophthalmology, orthopedic surgery, pain management, pediatrics, ENT, allergy and immunology, urology, OB-GYN, sports medicine, and plastic surgery.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How do physician practices get more referrals?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The physician practices that grow their referral networks fastest do three things consistently: they identify the 3-5 complementary specialties most likely to share patients with them, they build relationships with specific physicians within 10 miles of their office, and they close the loop on every referral with a clinical summary within 48 hours.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
    </div>
  )
}
