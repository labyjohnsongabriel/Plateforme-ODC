/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,

  // ==========================================================================
  // IMAGES
  // ==========================================================================
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
  },

  // ==========================================================================
  // REDIRECTIONS / REWRITES
  // ==========================================================================
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },

  // ==========================================================================
  // EN-TÊTES DE SÉCURITÉ
  // ==========================================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  // ==========================================================================
  // ESLINT & TYPESCRIPT
  // ==========================================================================
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // ==========================================================================
  // ENV PUBLIC
  // ==========================================================================
  env: {
    NEXT_PUBLIC_APP_NAME: 'ODC Platform',
  },

  // ==========================================================================
  // EXPERIMENTAL
  // ==========================================================================
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

module.exports = nextConfig;