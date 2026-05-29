import type { Metadata } from "next"
import ReferralLookupClient from "@/components/ReferralLookupClient"
import SiteNav from "@/components/SiteNav"
import SiteFooter from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Who Refers Patients to Your Specialty? Free Referral Lookup",
  description:
    "Free tool: select your physician specialty and instantly see which specialties refer patients to you, why they refer (real clinical triggers), and how strong each referral relationship is. No email required.",
  alternates: { canonical: "/referral-lookup" },
  openGraph: {
    title: "Free Physician Referral Partner Lookup",
    description:
      "See which specialties refer patients to yours, the clinical reasons they refer, and how strong each relationship is. No email required.",
    url: "https://sleftsignals.com/referral-lookup",
    type: "website",
  },
}

export default function ReferralLookupPage() {
  return (
    <div className="min-h-screen text-white overflow-hidden">
      <SiteNav />
      <ReferralLookupClient />
      <SiteFooter />
    </div>
  )
}
