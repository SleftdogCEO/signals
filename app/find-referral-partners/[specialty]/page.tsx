import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { specialties, cities, getSpecialty } from "@/lib/seo-data"
import { ArrowRight, Zap, MapPin, Users, CheckCircle, Stethoscope } from "lucide-react"

interface Props {
  params: Promise<{ specialty: string }>
}

export async function generateStaticParams() {
  return specialties.map((s) => ({ specialty: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specialty: slug } = await params
  const spec = getSpecialty(slug)
  if (!spec) return { title: "Not Found" }

  const title = `Find Referral Partners for ${spec.plural} | Sleft Signals`
  const description = `Find local healthcare providers who refer patients to ${spec.plural.toLowerCase()}. Build referral partnerships with ${spec.refersTo.slice(0, 3).join(", ")} near your practice.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://sleftsignals.com/find-referral-partners/${spec.slug}`,
      type: "website",
    },
  }
}

export default async function SpecialtyPage({ params }: Props) {
  const { specialty: slug } = await params
  const spec = getSpecialty(slug)
  if (!spec) notFound()

  const otherSpecialties = specialties.filter((s) => s.slug !== slug).slice(0, 6)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sleft Signals</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-slate-400 hover:text-white transition-colors font-medium">
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

      <main className="relative z-20 px-6 lg:px-12 pt-12 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <Stethoscope className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Referral Intelligence for {spec.plural}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Find Referral Partners for{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {spec.plural}
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {spec.description}
            </p>
          </div>

          {/* Who refers to you */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Who Refers Patients to {spec.plural}?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {spec.refersTo.map((partner) => (
                <div
                  key={partner}
                  className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-5"
                >
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{partner}</p>
                    <p className="text-sm text-slate-400">
                      Refers patients to {spec.plural.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why referrals beat ads */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Why Referrals Beat Ads for {spec.plural}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Higher Conversion</h3>
                <p className="text-slate-400">
                  Referred patients show up, follow through with treatment, and stay long-term. Ad-driven leads ghost after the first visit.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Zero Ad Spend</h3>
                <p className="text-slate-400">
                  Stop paying $2-5k/month to agencies. One strong referral relationship can send you 5-15 patients per month for free.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Local & Compounding</h3>
                <p className="text-slate-400">
                  Referral relationships compound over time. The longer you maintain them, the more patients flow in both directions.
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              How Sleft Signals Works for {spec.plural}
            </h2>
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Tell Us About Your Practice",
                  desc: `Enter your specialty, location, and the types of patients you treat. We'll immediately identify ${spec.refersTo[0].toLowerCase()} and other providers near you.`,
                },
                {
                  step: "2",
                  title: "We Find Your Referral Matches",
                  desc: `We scrape and verify local providers in complementary specialties -- ${spec.refersTo.slice(0, 3).join(", ")} -- within 5-10 miles of your practice.`,
                },
                {
                  step: "3",
                  title: "You Make The Connection",
                  desc: "We give you names, addresses, and specialties. You reach out, introduce yourself, and start building relationships that generate patients.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16 text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Find {spec.name} Referral Partners Near You
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
              See which providers in your area already refer to {spec.plural.toLowerCase()} -- and which ones you should be connecting with.
            </p>
            <Link
              href="/auth?signup=true"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-blue-500/25"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-slate-500 mt-4">Free to join. No credit card required.</p>
          </div>

          {/* City links */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              Find {spec.name} Referral Partners by City
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/find-referral-partners/${spec.slug}/${city.slug}`}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium"
                >
                  {spec.plural} in {city.name}, {city.stateAbbr}
                </Link>
              ))}
            </div>
          </div>

          {/* Other specialties */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Referral Partners for Other Specialties
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {otherSpecialties.map((s) => (
                <Link
                  key={s.slug}
                  href={`/find-referral-partners/${s.slug}`}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium"
                >
                  Referral Partners for {s.plural}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800 mt-20">
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
            "@type": "Service",
            name: `Referral Partner Matching for ${spec.plural}`,
            description: spec.description,
            provider: {
              "@type": "Organization",
              name: "Sleft Signals",
              url: "https://sleftsignals.com",
            },
            areaServed: { "@type": "Country", name: "United States" },
            serviceType: "Healthcare Referral Intelligence",
          }),
        }}
      />
    </div>
  )
}
