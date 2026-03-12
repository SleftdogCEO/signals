import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'sonner'
import "./globals.css"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Sleft Signals - Healthcare Referral Partner Matching (2026)",
    template: "%s | Sleft Signals",
  },
  description:
    "Stop paying agencies $3k/month. Find local healthcare providers who send you patients through referral partnerships. Free for providers.",
  metadataBase: new URL("https://sleftsignals.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sleft Signals - Healthcare Referral Partner Matching",
    description: "Find local healthcare providers who send you patients. No ads. No agencies. Just partnerships with your neighbors.",
    url: "https://sleftsignals.com",
    siteName: "Sleft Signals",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sleft Signals - Healthcare Referral Partner Matching",
    description: "Find local healthcare providers who send you patients. No ads. No agencies.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
