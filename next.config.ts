import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Type errors are enforced at build time (see `npm run lint` / `tsc`).
  typescript: {
    ignoreBuildErrors: false,
  },
  // Linting is run separately in CI to keep builds fast.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
};

export default nextConfig;
