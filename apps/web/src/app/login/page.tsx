import type { Metadata } from "next";

import { LoginTabs } from "@/components/login-tabs";

export const metadata: Metadata = {
  description:
    "Sign in to place a Cash on Delivery order and track your watches.",
  title: "Sign in · TikTrend",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  // Only allow same-origin relative paths to avoid open redirects.
  const next = rawNext?.startsWith("/") ? rawNext : undefined;

  return <LoginTabs next={next} />;
}
