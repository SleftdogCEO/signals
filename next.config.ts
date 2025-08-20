import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
