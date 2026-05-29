import Link from "next/link"
import { Zap } from "lucide-react"
import { specialties, cities } from "@/lib/seo-data"

// Shared footer. Replaces the decorative wordmark-only footers that every page
// hardcoded with a links-rich footer, so crawl depth to the specialty hubs is 1
// and to the top city pages is 2 from anywhere on the site.
const FOOTER_CITY_SLUGS = [
  "tampa-fl",
  "miami-fl",
  "orlando-fl",
  "houston-tx",
  "new-york-ny",
  "los-angeles-ca",
  "chicago-il",
  "atlanta-ga",
]

export default function SiteFooter() {
  const topSpecialties = specialties.slice(0, 8)
  const footerCities = cities.filter((c) => FOOTER_CITY_SLUGS.includes(c.slug))

  return (
    <footer className="relative z-10 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Sleft Signals</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Local referral intelligence for physician practices. Find the doctors down the street who can send you patients.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/find-referral-partners" className="text-slate-400 hover:text-white transition-colors">Find Partners</Link></li>
              <li><Link href="/referral-lookup" className="text-slate-400 hover:text-white transition-colors">Free Referral Lookup</Link></li>
              <li><Link href="/directory" className="text-slate-400 hover:text-white transition-colors">Provider Directory</Link></li>
              <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/auth?signup=true" className="text-slate-400 hover:text-white transition-colors">Get Started Free</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Top Specialties</h3>
            <ul className="space-y-2.5 text-sm">
              {topSpecialties.map((s) => (
                <li key={s.slug}>
                  <Link href={`/find-referral-partners/${s.slug}`} className="text-slate-400 hover:text-white transition-colors">
                    {s.plural}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Metros */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Top Metros</h3>
            <ul className="space-y-2.5 text-sm">
              {footerCities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/find-referral-partners/primary-care/${c.slug}`} className="text-slate-400 hover:text-white transition-colors">
                    {c.name}, {c.stateAbbr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/auth" className="text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth?signup=true" className="text-slate-400 hover:text-white transition-colors">Join the Network</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-slate-500">© Sleft Signals. Local referral intelligence for physician practices.</span>
        </div>
      </div>
    </footer>
  )
}
