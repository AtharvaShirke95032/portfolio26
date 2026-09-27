import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // pin the project root so a stray lockfile higher up (e.g. in ~) isn't mistaken for it
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
