import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // localhost:3000
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      // localhost без порта
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/uploads/**',
      },
      // ngrok-домены
      {
        protocol: 'https',
        hostname: '900c15e5d875.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '50be3812d14b.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'f1d2f00cf49f.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
