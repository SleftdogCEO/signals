import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { specialties, cities, getSpecialty, getCity } from "@/lib/seo-data"
import { ArrowRight, Zap, MapPin, Users, CheckCircle, Stethoscope } from "lucide-react"

interface Props {
  params: Promise<{ specialty: string; city: string }>
}

export async function generateStaticParams() {
  const params: { specialty: string; city: string }[] = []
  for (const s of specialties) {
    for (const c of cities) {
      params.push({ specialty: s.slug, city: c.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specialty: specSlug, city: citySlug } = await params
  const spec = getSpecialty(specSlug)
  const city = getCity(citySlug)
  if (!spec || !city) return { title: "Not Found" }

  const title = `${spec.plural} in ${city.name}, ${city.stateAbbr} - Find Referral Partners (2026)`
  const description = `${spec.plural} in ${city.name}: find ${spec.refersTo[0]} & ${spec.refersTo[1]} nearby who send patients. Zero ad spend. See who's near your practice.`

  return {
    title,
    description,
    alternates: { canonical: `/find-referral-partners/${spec.slug}/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `https://sleftsignals.com/find-referral-partners/${spec.slug}/${city.slug}`,
      type: "website",
    },
  }
}

export default async function SpecialtyCityPage({ params }: Props) {
  const { specialty: specSlug, city: citySlug } = await params
  const spec = getSpecialty(specSlug)
  const city = getCity(citySlug)
  if (!spec || !city) notFound()

  const otherCities = cities.filter((c) => c.slug !== city.slug)
  const otherSpecialties = specialties.filter((s) => s.slug !== spec.slug)

  return (
    <div className="min-h-screen text-white">
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
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <Link href={`/find-referral-partners/${spec.slug}`} className="hover:text-slate-300">
              {spec.plural}
            </Link>
            <span>/</span>
            <span className="text-slate-300">{city.name}, {city.stateAbbr}</span>
          </div>

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">{city.name}, {city.state}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Referral Partners for {spec.plural} in{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {city.name}, {city.stateAbbr}
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Connect with {spec.refersTo.slice(0, 3).join(", ")} and other providers near your {city.name} practice who can send you patients.
            </p>
          </div>

          {/* Local context */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              The {city.name} Referral Landscape for {spec.plural}
            </h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                {city.name}, {city.state} has a competitive healthcare market. {spec.plural} in the {city.name} metro area compete for patients against dozens of other practices -- many of whom are spending thousands on Google and Facebook ads every month.
              </p>
              <p>
                The {spec.plural.toLowerCase()} who grow fastest in {city.name} aren&apos;t the ones with the biggest ad budget. They&apos;re the ones with the strongest referral relationships. A single {spec.refersTo[0].toLowerCase().replace(/s$/, "")} 2 miles from your practice could send you 5-15 patients per month -- if they know you exist.
              </p>
              <p>
                Sleft Signals identifies {spec.refersTo.join(", ").toLowerCase()} within 5-10 miles of your {city.name} practice who share your patient population and are likely to refer.
              </p>
            </div>
          </div>

          {/* Who refers */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Top Referral Sources for {spec.plural} in {city.name}
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
                      Near your {city.name} practice
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white mb-2">5-15</p>
              <p className="text-slate-400">Patients per month from a single referral partner</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white mb-2">3-5x</p>
              <p className="text-slate-400">Higher conversion than ad-driven leads</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white mb-2">5-10 mi</p>
              <p className="text-slate-400">Radius we search for referral partners</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              FAQs: {spec.name} Referrals in {city.name}
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: `How do ${spec.plural.toLowerCase()} in ${city.name} get more referrals?`,
                  a: `The fastest way for ${spec.plural.toLowerCase()} in ${city.name} to grow is by building referral relationships with nearby ${spec.refersTo[0].toLowerCase()} and ${spec.refersTo[1].toLowerCase()}. These providers see patients who need your services daily and will refer if they know your practice.`,
                },
                {
                  q: `Who sends the most patients to ${spec.plural.toLowerCase()} in ${city.name}, ${city.stateAbbr}?`,
                  a: `In the ${city.name} market, ${spec.refersTo[0]} are typically the #1 referral source for ${spec.plural.toLowerCase()}, followed by ${spec.refersTo[1]}. Practices with 10+ active referral relationships in ${city.name} see 30-60% of new patients from referrals.`,
                },
                {
                  q: `Is Sleft Signals free for ${spec.plural.toLowerCase()} in ${city.name}?`,
                  a: `Yes. Sleft Signals is free to join for all healthcare providers in ${city.name}. We identify ${spec.refersTo.join(", ").toLowerCase()} near your practice who are likely referral partners.`,
                },
                {
                  q: `How many ${spec.plural.toLowerCase()} are in ${city.name}?`,
                  a: `${city.name}, ${city.state} has a competitive healthcare market with many ${spec.plural.toLowerCase()} practices. Standing out requires more than ads -- it requires trusted referral relationships with nearby providers who send patients your way consistently.`,
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-slate-700 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA - Snapshot */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16 text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See Who&apos;s Near Your {city.name} Practice
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
              Get a free snapshot showing {spec.refersTo[0].toLowerCase()} and other referral partners within 10 miles. Takes 30 seconds.
            </p>
            <Link
              href="/snapshot"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-all shadow-xl shadow-blue-500/25"
            >
              Get Your Free Snapshot
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-slate-500 mt-4">No signup required. Just enter your specialty and location.</p>
          </div>

          {/* Other cities */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              {spec.plural} Referral Partners in Other Cities
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/find-referral-partners/${spec.slug}/${c.slug}`}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium"
                >
                  {c.name}, {c.stateAbbr}
                </Link>
              ))}
            </div>
          </div>

          {/* Other specialties in this city */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Other Specialties in {city.name}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {otherSpecialties.map((s) => (
                <Link
                  key={s.slug}
                  href={`/find-referral-partners/${s.slug}/${city.slug}`}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium"
                >
                  {s.plural} in {city.name}
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
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: `Referral Partner Matching for ${spec.plural} in ${city.name}, ${city.stateAbbr}`,
              description: `Find referral partners for ${spec.plural.toLowerCase()} in ${city.name}, ${city.state}.`,
              provider: {
                "@type": "Organization",
                name: "Sleft Signals",
                url: "https://sleftsignals.com",
              },
              areaServed: {
                "@type": "City",
                name: city.name,
                containedInPlace: { "@type": "State", name: city.state },
              },
              serviceType: "Healthcare Referral Intelligence",
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://sleftsignals.com" },
                { "@type": "ListItem", position: 2, name: spec.plural, item: `https://sleftsignals.com/find-referral-partners/${spec.slug}` },
                { "@type": "ListItem", position: 3, name: `${city.name}, ${city.stateAbbr}`, item: `https://sleftsignals.com/find-referral-partners/${spec.slug}/${city.slug}` },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `How do ${spec.plural.toLowerCase()} in ${city.name} get more referrals?`,
                  acceptedAnswer: { "@type": "Answer", text: `The fastest way for ${spec.plural.toLowerCase()} in ${city.name} to grow is by building referral relationships with nearby ${spec.refersTo[0].toLowerCase()} and ${spec.refersTo[1].toLowerCase()}.` },
                },
                {
                  "@type": "Question",
                  name: `Who sends the most patients to ${spec.plural.toLowerCase()} in ${city.name}, ${city.stateAbbr}?`,
                  acceptedAnswer: { "@type": "Answer", text: `${spec.refersTo[0]} are typically the #1 referral source for ${spec.plural.toLowerCase()} in ${city.name}, followed by ${spec.refersTo[1]}.` },
                },
                {
                  "@type": "Question",
                  name: `Is Sleft Signals free for ${spec.plural.toLowerCase()} in ${city.name}?`,
                  acceptedAnswer: { "@type": "Answer", text: `Yes. Sleft Signals is free to join for all healthcare providers in ${city.name}.` },
                },
                {
                  "@type": "Question",
                  name: `How many ${spec.plural.toLowerCase()} are in ${city.name}?`,
                  acceptedAnswer: { "@type": "Answer", text: `${city.name}, ${city.state} has a competitive healthcare market with many ${spec.plural.toLowerCase()} practices. Standing out requires trusted referral relationships with nearby providers.` },
                },
              ],
            },
          ]),
        }}
      />
    </div>
  )
}
