"use client";

import { HeartIcon } from "lucide-react";
import Link from "next/link";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <nav aria-label="Main" className="flex items-center gap-6">
          <Link className="font-semibold text-base tracking-tight" href="/">
            TikTrend
          </Link>
          <Link
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/watches"
          >
            Watches
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            aria-label="Your wishlist"
            render={<Link href="/wishlist" />}
            size="icon-sm"
            variant="ghost"
          >
            <HeartIcon data-icon />
          </Button>
          <CartDrawer />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
