import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drahemedabdellalif-api.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'api.drahmedabdellatif.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
  experimental: {},
  webpack(webpackConfig) {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@dr-ahmed/shared': path.resolve(__dirname, 'src/lib/shared.ts'),
    };
    return webpackConfig;
  },
};

export default withNextIntl(config);
