import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable proper hot reloading but optimize for development
  reactStrictMode: true,
  // Fix cross-origin issue for preview
  allowedDevOrigins: ['preview-chat-b3329655-0eb7-4a73-839e-beeb4cbd8b6b.space.z.ai'],
  // Optimize webpack for development
  webpack: (config, { dev }) => {
    if (dev) {
      // Optimize for development performance
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
