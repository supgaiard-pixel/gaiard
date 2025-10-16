import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configuration pour OVH
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: '',
  // Désactiver ESLint temporairement pour le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['fs', 'path']
};

export default nextConfig;
