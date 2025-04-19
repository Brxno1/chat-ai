import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['apcckeylnyublmecwzu.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apcckeylnyublmecwzu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
