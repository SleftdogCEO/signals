import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getBlogPost, getAllBlogPosts, blogPosts } from "@/lib/blog-posts"
import { specialties } from "@/lib/seo-data"
import SiteNav from "@/components/SiteNav"
import SiteFooter from "@/components/SiteFooter"

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
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
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

  // Only the hand-written posts get a real physician byline + BlogPosting/Person
  // schema. The programmatic posts stay unbylined Article so we never attach
  // Dr. Denmark's name (and E-E-A-T weight) to templated content.
  const isHandWritten = blogPosts.some((p) => p.slug === post.slug)

  return (
    <div className="min-h-screen text-white">
      {/* Nav */}
      <SiteNav />

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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4 bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
              {post.title}
            </h1>
            <p className="text-lg text-slate-400">{post.excerpt}</p>
          </div>

          {isHandWritten && (
            <div className="flex items-center gap-3 mb-10 pb-8 border-b border-slate-800">
              <Image
                src="/grant-headshot.png"
                alt="Dr. Grant Denmark, DO"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover object-top border border-white/10"
              />
              <div>
                <p className="text-white font-semibold leading-tight">Dr. Grant Denmark, DO</p>
                <p className="text-sm text-slate-500">Emergency Medicine Resident &middot; Founder, Sleft Signals</p>
              </div>
            </div>
          )}

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

          {/* Related Specialties */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-4">Find Referral Partners by Specialty</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {specialties.slice(0, 9).map((s) => (
                <Link
                  key={s.slug}
                  href={`/find-referral-partners/${s.slug}`}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium"
                >
                  {s.plural} Referral Partners
                </Link>
              ))}
            </div>
            <p className="mt-4">
              <Link href="/find-referral-partners" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Browse all {specialties.length} specialties →
              </Link>
            </p>
          </div>
        </article>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": isHandWritten ? "BlogPosting" : "Article",
              headline: post.title,
              description: post.metaDescription,
              datePublished: post.date,
              dateModified: post.date,
              image: "https://sleftsignals.com/opengraph-image",
              mainEntityOfPage: `https://sleftsignals.com/blog/${post.slug}`,
              author: isHandWritten
                ? {
                    "@type": "Person",
                    name: "Grant Denmark, DO",
                    jobTitle: "Emergency Medicine Resident Physician",
                    image: "https://sleftsignals.com/grant-headshot.png",
                    url: "https://sleftsignals.com",
                  }
                : {
                    "@type": "Organization",
                    name: "Sleft Signals",
                    url: "https://sleftsignals.com",
                  },
              publisher: {
                "@type": "Organization",
                name: "Sleft Signals",
                url: "https://sleftsignals.com",
                logo: {
                  "@type": "ImageObject",
                  url: "https://sleftsignals.com/logo.svg",
                },
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://sleftsignals.com" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://sleftsignals.com/blog" },
                { "@type": "ListItem", position: 3, name: post.title, item: `https://sleftsignals.com/blog/${post.slug}` },
              ],
            },
          ]),
        }}
      />
    </div>
  )
}

function renderContent(content: string): string {
  // First, extract and replace custom tables with placeholders
  const tables: string[] = []
  const withPlaceholders = content.replace(
    /\[TABLE\]\n([\s\S]*?)\[\/TABLE\]/g,
    (_, tableContent: string) => {
      const lines = tableContent.trim().split("\n")
      let html = '<div class="signals-table-wrap"><table class="signals-table"><thead>'

      for (const line of lines) {
        if (line.startsWith("[HEADER]") && line.endsWith("[/HEADER]")) {
          const cells = line.slice(8, -9).split("|")
          html += "<tr>"
          for (const cell of cells) {
            html += `<th>${cell.trim()}</th>`
          }
          html += "</tr></thead><tbody>"
        } else if (line.startsWith("[ROW]") && line.endsWith("[/ROW]")) {
          const cells = line.slice(5, -6).split("|")
          html += "<tr>"
          for (const cell of cells) {
            html += `<td>${cell.trim()}</td>`
          }
          html += "</tr>"
        }
      }

      html += "</tbody></table></div>"
      const idx = tables.length
      tables.push(html)
      return `__TABLE_PLACEHOLDER_${idx}__`
    }
  )

  // Also handle markdown tables (| Header | Header | format) from existing posts
  const withMdTables = withPlaceholders.replace(
    /((?:^\|.+\|$\n?){2,})/gm,
    (block: string) => {
      const rows = block.trim().split("\n").filter((r) => r.trim())
      // Skip separator rows like |---|---|
      const dataRows = rows.filter((r) => !/^\|[\s\-:|]+\|$/.test(r))
      if (dataRows.length < 1) return block

      let html = '<div class="signals-table-wrap"><table class="signals-table"><thead>'
      const headerCells = dataRows[0].split("|").filter((c) => c.trim())
      html += "<tr>"
      for (const cell of headerCells) {
        html += `<th>${cell.trim()}</th>`
      }
      html += "</tr></thead><tbody>"

      for (let i = 1; i < dataRows.length; i++) {
        const cells = dataRows[i].split("|").filter((c) => c.trim())
        html += "<tr>"
        for (const cell of cells) {
          html += `<td>${cell.trim()}</td>`
        }
        html += "</tr>"
      }

      html += "</tbody></table></div>"
      const idx = tables.length
      tables.push(html)
      return `__TABLE_PLACEHOLDER_${idx}__`
    }
  )

  // Now process line by line
  const rendered = withMdTables
    .split("\n")
    .map((line) => {
      // Check for table placeholder
      const placeholderMatch = line.match(/^__TABLE_PLACEHOLDER_(\d+)__$/)
      if (placeholderMatch) return tables[parseInt(placeholderMatch[1])]
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`
      if (line.startsWith("> ")) return `<blockquote>${line.slice(2)}</blockquote>`
      if (line.startsWith("**") && line.endsWith("**"))
        return `<p><strong>${line.slice(2, -2)}</strong></p>`
      if (line.trim() === "") return ""
      return `<p>${line}</p>`
    })
    .join("\n")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/(<blockquote>.*<\/blockquote>\n?)+/g, (match) => `<div class="signals-blockquote">${match}</div>`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

  return rendered
}
