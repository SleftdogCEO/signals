import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  images: {
    domains: [
      // Google Services
      'streetviewpixels-pa.googleapis.com',
      'maps.googleapis.com',
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'encrypted-tbn0.gstatic.com',
      
      // Business Images
      'via.placeholder.com',
      'picsum.photos',
      'images.unsplash.com',
      'plus.unsplash.com',
      
      // News Image Sources
      'cdn.cnn.com',
      'static01.nyt.com',
      'www.reuters.com',
      'media.cnn.com',
      'cloudfront.net',
      'amazonaws.com',
      
      // Placeholder services
      'placeholder.com',
      'dummyimage.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'streetviewpixels-pa.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 301 redirects for retired non-physician specialty pages and blog posts.
  // Preserves any inbound link equity instead of returning 404.
  async redirects() {
    const retiredSpecialties = [
      "chiropractors",
      "physical-therapists",
      "dentists",
      "orthodontists",
      "mental-health",
      "med-spas",
      "optometrists",
      "podiatrists",
      "oral-surgeons",
    ]
    const specialtyRedirects = retiredSpecialties.flatMap((slug) => [
      {
        source: `/find-referral-partners/${slug}`,
        destination: "/find-referral-partners",
        permanent: true,
      },
      {
        source: `/find-referral-partners/${slug}/:city`,
        destination: "/find-referral-partners",
        permanent: true,
      },
    ])
    const retiredBlogPosts = [
      "cross-referral-playbook-dentists-orthodontists",
      "pt-practice-found-14-referring-physicians",
    ]
    const blogRedirects = retiredBlogPosts.map((slug) => ({
      source: `/blog/${slug}`,
      destination: "/blog",
      permanent: true,
    }))
    // Programmatic blog posts of the form /blog/find-{specialty}-referral-partners-{city}
    // for retired specialties. Wildcard match catches every city variant.
    // Programmatic slugs are a single path segment of the form
    // find-{specialty}-referral-partners-{city}. path-to-regexp can't use
    // a wildcard after a non-/ separator, so we match with a regex
    // constraint on a named param instead.
    const programmaticRedirects = retiredSpecialties.map((slug) => ({
      source: `/blog/:fullSlug(find-${slug}-referral-partners-.*)`,
      destination: "/blog",
      permanent: true,
    }))
    // Specialty strategy guides (e.g. /blog/dermatologists-referral-strategy-guide)
    // for retired specialties.
    const strategyGuideRedirects = retiredSpecialties.map((slug) => ({
      source: `/blog/${slug}-referral-strategy-guide`,
      destination: "/blog",
      permanent: true,
    }))
    return [
      ...specialtyRedirects,
      ...blogRedirects,
      ...programmaticRedirects,
      ...strategyGuideRedirects,
    ]
  },
  // Add static file handling for video
  async rewrites() {
    return [
      {
        source: '/avatars/:path*',
        destination: '/avatars/:path*',
      },
    ]
  },
  // Ensure proper MIME types for video files
  async headers() {
    return [
      {
        source: '/avatars/:path*.mp4',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/avatars/:path*.webm',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/webm',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/avatars/:path*.(png|jpg|jpeg|gif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
