import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ['*'],

  async redirects() {
    const sessionCookies = [
      'better-auth.session_token',
      '__Secure-better-auth.session_token',
    ]

    const protectedRedirects = ['/dashboard', '/chat'].map((path) => ({
      source: `${path}/:path*`,
      missing: [
        { type: 'cookie' as const, key: 'better-auth.session_token' },
        { type: 'cookie' as const, key: '__Secure-better-auth.session_token' },
      ],
      destination: '/auth',
      permanent: false,
    }))

    const authRedirects = sessionCookies.map((cookieName) => ({
      source: '/auth',
      has: [{ type: 'cookie' as const, key: cookieName }],
      destination: '/',
      permanent: false,
    }))

    return [...protectedRedirects, ...authRedirects]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'svlgyuqyhfnqdfqvgqjz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },

  serverExternalPackages: [
    'puppeteer',
    'puppeteer-core',
    '@sparticuz/chromium',
    'sharp',
    'shiki',
    '@shikijs/transformers',
    'cheerio',
    'nodemailer',
    '@sendgrid/mail',
    'prisma',
    '@prisma/client',
    '@prisma/client-runtime-utils',
  ],

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.parallelism = 1

      config.devtool = 'eval-cheap-source-map'
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'node:crypto': false,
      }
    }

    return config
  },
}

export default nextConfig
