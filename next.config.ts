import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbo: {
    resolveAlias: {
      "@/generated/prisma/client": path.join(__dirname, "src/generated/prisma/client"),
    },
  },
};

export default nextConfig;
