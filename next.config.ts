import type { NextConfig } from 'next';
import nextI18NextConfig from './next-i18next.config';

const nextConfig: NextConfig = {
  ...nextI18NextConfig,
  eslint: {
    ignoreDuringBuilds: true, // отключаем ESLint при билде
  },
  typescript: {
    ignoreBuildErrors: true, // отключаем остановку из-за ошибок типов
  },
};

export default nextConfig;
