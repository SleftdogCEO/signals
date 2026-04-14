import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Redirects stale /blog/find-[specialty]-referral-partners-[city] URLs to
 * /find-referral-partners/[specialty]/[city]. These two URL patterns were
 * serving identical content and cannibalizing each other in Google's index.
 * Tool pages have richer schema (FAQPage, Service, City, State) and larger
 * bodies, so we're consolidating on the tool pattern and 301'ing the blog
 * pattern so Google transfers authority without losing inbound links.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const match = pathname.match(/^\/blog\/find-(.+)-referral-partners-(.+)$/)
  if (match) {
    const [, specialty, city] = match
    const url = req.nextUrl.clone()
    url.pathname = `/find-referral-partners/${specialty}/${city}`
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/blog/find-:path*"],
}
