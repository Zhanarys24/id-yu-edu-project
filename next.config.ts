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
        hostname: '3e81d9dc4bcc.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '3e81d9dc4bcc.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '3e81d9dc4bcc.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
