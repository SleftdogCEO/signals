import type { Metadata } from "next"
import Link from "next/link"
import { specialties, cities } from "@/lib/seo-data"
import { ArrowRight, Zap, Stethoscope, MapPin } from "lucide-react"
import SiteNav from "@/components/SiteNav"
import SiteFooter from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Find Physician Referral Partners by Specialty & City (2026)",
  description: `Browse referral partner opportunities for ${specialties.length} physician specialties across ${cities.length} cities. Free provider matching. No ads, no agencies -- just local referral relationships.`,
  alternates: { canonical: "/find-referral-partners" },
  openGraph: {
    title: "Find Physician Referral Partners - Sleft Signals",
    description: `Browse referral partner opportunities for ${specialties.length} physician specialties across ${cities.length} cities.`,
    url: "https://sleftsignals.com/find-referral-partners",
    type: "website",
  },
}

export default function FindReferralPartnersPage() {
  return (
    <div className="min-h-screen text-white">
      <SiteNav />

      <main className="relative z-20 px-6 lg:px-12 pt-12 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Find{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Referral Partners
              </span>{" "}
              Near You
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Browse {specialties.length} healthcare specialties across {cities.length} cities. Find providers who send patients to practices like yours.
            </p>
          </div>

          {/* Specialties Grid */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Stethoscope className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Browse by Specialty
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {specialties.map((s) => (
                <Link
                  key={s.slug}
                  href={`/find-referral-partners/${s.slug}`}
                  className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all"
                >
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {s.plural}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    Refers to: {s.refersTo.slice(0, 3).join(", ")}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-blue-400 font-medium">
                    View partners <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Cities Grid */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Browse by City
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 md:grid-cols-5 gap-3">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/find-referral-partners/${specialties[0].slug}/${c.slug}`}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium text-center"
                >
                  {c.name}, {c.stateAbbr}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Not Sure Where to Start?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
              Sign up free and we&apos;ll match you with referral partners based on your specialty and location.
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
        </div>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Find Healthcare Referral Partners",
              description: `Browse referral partner opportunities for ${specialties.length} healthcare specialties across ${cities.length} cities.`,
              url: "https://sleftsignals.com/find-referral-partners",
              provider: {
                "@type": "Organization",
                name: "Sleft Signals",
                url: "https://sleftsignals.com",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://sleftsignals.com" },
                { "@type": "ListItem", position: 2, name: "Find Referral Partners", item: "https://sleftsignals.com/find-referral-partners" },
              ],
            },
          ]),
        }}
      />
    </div>
  )
}
