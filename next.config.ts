import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  // Fix cross-origin issue for preview
  allowedDevOrigins: ['preview-chat-b3329655-0eb7-4a73-839e-beeb4cbd8b6b.space.z.ai'],
  // Optimize experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
