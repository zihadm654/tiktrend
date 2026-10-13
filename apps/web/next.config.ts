import "@tiktrend/env/web";

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(appDir, "../..");
const turbopackRoot = existsSync(join(workspaceRoot, "packages"))
  ? workspaceRoot
  : appDir;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "picsum.photos", protocol: "https" },
      { hostname: "fastly.picsum.photos", protocol: "https" },
    ],
  },
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  reactCompiler: true,
  turbopack: {
    root: turbopackRoot,
  },
  typedRoutes: true,
};

export default nextConfig;
