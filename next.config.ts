import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // better-sqlite3 is a native Node.js addon — it must not be bundled by webpack
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
