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
      // Продакшен домен
      {
        protocol: 'https',
        hostname: 'id.yu.edu.kz',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'id.yu.edu.kz',
        port: '',
        pathname: '/media/**',
      },
      // Handle malformed URLs with empty hostname (http:///uploads/...)
      {
        protocol: 'http',
        hostname: '',
        port: '',
        pathname: '/uploads/**',
      },
      // Handle uploads hostname specifically
      {
        protocol: 'http',
        hostname: 'uploads',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploads',
        port: '',
        pathname: '/**',
      },
      // Handle any hostname for uploads (fallback)
      {
        protocol: 'http',
        hostname: '*',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
