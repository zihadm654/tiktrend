"use client";

import { HeartIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { loginHref } from "@/lib/catalog-params";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  className?: string;
  label?: string;
  productId: string;
}

export function WishlistButton({
  productId,
  className,
  label,
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const wishlist = useWishlist();
  const active = wishlist.has(productId);

  const handleToggle = () => {
    if (!wishlist.isSignedIn) {
      router.push(loginHref(pathname));
      return;
    }
    wishlist.toggle(productId);
  };

  return (
    <Button
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn("shrink-0", className)}
      onClick={handleToggle}
      size="icon-sm"
      type="button"
      variant={active ? "default" : "outline"}
    >
      <HeartIcon
        className={cn(active ? "fill-current" : undefined)}
        data-icon
      />
      {label ? (
        <span className={cn(active ? "text-primary-foreground" : undefined)}>
          {label}
        </span>
      ) : null}
    </Button>
  );
}
