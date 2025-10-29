import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack configuration for monorepo
  // Note: turbopack.root was causing issues, removed it
  // Next.js should auto-detect the workspace root
};

export default nextConfig;
