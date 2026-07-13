import type { Metadata } from "next"
import Link from "next/link"
import { getPaginatedBlogPosts } from "@/lib/blog-posts"
import { specialties } from "@/lib/seo-data"
import SiteNav from "@/components/SiteNav"
import SiteFooter from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Physician Referral Strategies for Practice Growth",
  description:
    "Practical guides on physician referrals, closed-loop tracking, and finding referral partners near you. Grow your independent practice without ad spend.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Healthcare Referral Blog - Sleft Signals",
    description:
      "Referral intelligence, practice growth strategies, and local market analysis for healthcare providers.",
    url: "https://sleftsignals.com/blog",
  },
}

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const categoryFilter = params.category || ""
  const { posts, totalPages, totalPosts, currentPage } = getPaginatedBlogPosts(page, 24)

  // Filter by category if specified (client-side for simplicity with pagination)
  const displayPosts = categoryFilter
    ? posts.filter((p) => p.category === categoryFilter)
    : posts

  const categories = [
    "All",
    "Local Market Analysis",
    "Referral Strategy",
    "Practice Growth",
    "Referral Intelligence",
    "Networking Guide",
  ]

  return (
    <div className="min-h-screen text-white">
      {/* Nav */}
      <SiteNav />

      <main className="relative z-20 px-6 lg:px-12 pt-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Blog</h1>
          <p className="text-xl text-slate-400 mb-6">
            Referral intelligence, practice growth strategies, and data-driven
            insights for healthcare providers.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            {totalPosts.toLocaleString()} articles
          </p>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => {
              const isActive = cat === "All" ? !categoryFilter : categoryFilter === cat
              const href = cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                    isActive
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      : "bg-slate-900/50 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  {cat}
                </Link>
              )
            })}
          </div>

          {displayPosts.length === 0 ? (
            <p className="text-slate-500 text-lg">
              No posts found. Try a different category or check back soon.
            </p>
          ) : (
            <div className="space-y-6">
              {displayPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-900/80">
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
                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-sm lg:text-base line-clamp-2">
                      {post.excerpt}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !categoryFilter && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:border-blue-500/50 hover:text-white transition-all text-sm font-medium"
                >
                  Previous
                </Link>
              )}
              {/* Show page numbers with ellipsis for large ranges */}
              {(() => {
                const pages: (number | string)[] = []
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  pages.push(1)
                  if (currentPage > 3) pages.push("...")
                  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    pages.push(i)
                  }
                  if (currentPage < totalPages - 2) pages.push("...")
                  pages.push(totalPages)
                }
                return pages.map((p, idx) =>
                  typeof p === "string" ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-600">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={`/blog?page=${p}`}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        p === currentPage
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                          : "bg-slate-900/50 border border-slate-800 text-slate-400 hover:border-blue-500/50 hover:text-white"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )
              })()}
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:border-blue-500/50 hover:text-white transition-all text-sm font-medium"
                >
                  Next
                </Link>
              )}
            </div>
          )}

          {/* Specialty Links */}
          <div className="mt-16 pt-12 border-t border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Find Referral Partners by Specialty</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
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
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
