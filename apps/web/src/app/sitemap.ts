import { env } from "@tiktrend/env/server";
import type { MetadataRoute } from "next";

const TRAILING_SLASH = /\/$/;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.CORS_ORIGIN.replace(TRAILING_SLASH, "");
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: "daily" | "monthly";
  }> = [
    { changeFrequency: "daily", path: "", priority: 1 },
    { changeFrequency: "daily", path: "/watches", priority: 0.9 },
    { changeFrequency: "monthly", path: "/about", priority: 0.5 },
    { changeFrequency: "monthly", path: "/contact", priority: 0.5 },
    { changeFrequency: "monthly", path: "/shipping", priority: 0.4 },
    { changeFrequency: "monthly", path: "/privacy", priority: 0.3 },
  ];

  return routes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified: new Date(),
    priority: route.priority,
    url: `${base}${route.path}`,
  }));
}
