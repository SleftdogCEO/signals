import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogPost, getAllBlogPosts } from "@/lib/blog-posts"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: "Post Not Found" }

  return {
    title: `${post.title} | Sleft Signals Blog`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://sleftsignals.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

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
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            All Posts
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
        <article className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                {post.category}
              </span>
              <span className="text-sm text-slate-500">{post.date}</span>
              <span className="text-sm text-slate-500">{post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-slate-400">{post.excerpt}</p>
          </div>

          <div
            className="prose-signals"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Find Referral Partners Near You
            </h3>
            <p className="text-slate-400 mb-6">
              See which providers in your area could send you patients.
            </p>
            <Link
              href="/auth?signup=true"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Get Your Free Snapshot
            </Link>
          </div>
        </article>
      </main>

      <footer className="relative z-10 px-6 py-12 border-t border-slate-800 mt-20">
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.metaDescription,
            datePublished: post.date,
            author: {
              "@type": "Organization",
              name: "Sleft Signals",
            },
            publisher: {
              "@type": "Organization",
              name: "Sleft Signals",
              url: "https://sleftsignals.com",
            },
          }),
        }}
      />
    </div>
  )
}

function renderContent(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`
      if (line.startsWith("**") && line.endsWith("**"))
        return `<p><strong>${line.slice(2, -2)}</strong></p>`
      if (line.trim() === "") return ""
      return `<p>${line}</p>`
    })
    .join("\n")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
}
