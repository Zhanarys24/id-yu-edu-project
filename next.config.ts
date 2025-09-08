import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '900c15e5d875.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig