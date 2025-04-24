import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['apcckevlnyublmecrwzu.supabase.co', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apcckevlnyublmecrwzu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
