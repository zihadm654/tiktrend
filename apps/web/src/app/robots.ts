import { env } from "@tiktrend/env/server";
import type { MetadataRoute } from "next";

const TRAILING_SLASH = /\/$/;

export default function robots(): MetadataRoute.Robots {
  const base = env.CORS_ORIGIN.replace(TRAILING_SLASH, "");

  return {
    rules: [
      {
        allow: "/",
        disallow: ["/admin", "/api", "/checkout", "/orders", "/wishlist"],
        userAgent: "*",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
