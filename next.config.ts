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
        pathname: '/uploads/**',
      },
      // Продакшен домен
      {
        protocol: 'https',
        hostname: 'id.yu.edu.kz',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'id.yu.edu.kz',
        pathname: '/media/**',
      },
      // YU.edu.kz домен для новостей
      {
        protocol: 'https',
        hostname: 'yu.edu.kz',
        pathname: '/wp-content/uploads/**',
      },
      // Handle uploads hostname specifically
      {
        protocol: 'http',
        hostname: 'uploads',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploads',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
