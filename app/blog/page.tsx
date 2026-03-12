import type { Metadata } from "next"
import Link from "next/link"
import { getAllBlogPosts } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: "Healthcare Referral Blog - Practice Growth Strategies (2026)",
  description:
    "Data-driven referral strategies for healthcare providers. NPI analysis, CMS referral data, local market intelligence. Grow your practice without ads.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Healthcare Referral Blog - Sleft Signals",
    description:
      "Referral intelligence, practice growth strategies, and local market analysis for healthcare providers.",
    url: "https://sleftsignals.com/blog",
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Sleft Signals</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="text-white font-medium"
          >
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

      <main className="relative z-20 px-6 lg:px-12 pt-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Blog</h1>
          <p className="text-xl text-slate-400 mb-12">
            Referral intelligence, practice growth strategies, and data-driven
            insights for healthcare providers.
          </p>

          {posts.length === 0 ? (
            <p className="text-slate-500 text-lg">
              Posts coming soon. Check back shortly.
            </p>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-900/80">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-sm text-slate-500">
                        {post.date}
                      </span>
                      <span className="text-sm text-slate-500">
                        {post.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-400 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-semibold text-white">Sleft Signals</span>
          </Link>
          <span className="text-sm text-slate-500">
            Local referral intelligence for healthcare practices
          </span>
        </div>
      </footer>
    </div>
  )
}
