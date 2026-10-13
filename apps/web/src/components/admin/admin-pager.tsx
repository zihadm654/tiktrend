"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface AdminPagerProps {
  basePath: string;
  page: number;
  query?: Record<string, string | undefined>;
  totalPages: number;
}

export function AdminPager({
  page,
  totalPages,
  basePath,
  query,
}: AdminPagerProps) {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  const goTo = (next: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value) {
        params.set(key, value);
      }
    }
    if (next > 1) {
      params.set("page", String(next));
    }
    const qs = params.toString();
    router.push((qs ? `${basePath}?${qs}` : basePath) as Route);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        disabled={page <= 1}
        onClick={() => goTo(Math.max(1, page - 1))}
        size="sm"
        type="button"
        variant="outline"
      >
        Previous
      </Button>
      <span className="text-muted-foreground text-xs tabular-nums">
        Page {page} of {totalPages}
      </span>
      <Button
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
        size="sm"
        type="button"
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
}
