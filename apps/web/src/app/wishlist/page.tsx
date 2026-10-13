"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { HeartIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { authClient } from "@/lib/auth-client";
import { loginHref } from "@/lib/catalog-params";
import { orpc, queryClient } from "@/utils/orpc";

const FALLBACK_IMAGE = "https://picsum.photos/seed/watch-placeholder/800/800";

export default function WishlistPage() {
  const router = useRouter();
  const sessionQuery = authClient.useSession();
  const isSignedIn = sessionQuery.data !== null && !sessionQuery.isPending;

  const itemsQuery = useQuery(
    orpc.wishlist.getWishlist.queryOptions({ enabled: isSignedIn })
  );

  const removeMutation = useMutation(
    orpc.wishlist.toggle.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  if (!isSignedIn) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HeartIcon />
            </EmptyMedia>
            <EmptyTitle>Sign in to see your wishlist</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            Save watches you love and find them here whenever you sign back in.
          </EmptyDescription>
          <Button onClick={() => router.push(loginHref("/wishlist"))}>
            Sign in
          </Button>
        </Empty>
      </div>
    );
  }

  const items = itemsQuery.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-3xl tracking-tight">Your Wishlist</h1>
        <p className="text-muted-foreground text-sm">
          {items.length > 0
            ? `${items.length} saved watch${items.length === 1 ? "" : "es"}`
            : "Watches you save will appear here."}
        </p>
      </header>

      {items.length === 0 ? (
        <Empty className="min-h-72">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HeartIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing saved yet</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            Tap the heart on any watch to add it to your wishlist.
          </EmptyDescription>
          <Button render={<Link href="/watches" />}>Browse watches</Button>
        </Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li className="group flex flex-col gap-3" key={item.productId}>
              <Link
                className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
                href={`/watches/${item.slug}`}
              >
                <Image
                  alt={item.name}
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  src={item.images[0] ?? FALLBACK_IMAGE}
                />
                {item.inStock ? null : (
                  <span className="absolute top-2 left-2 rounded-full bg-secondary px-2 py-0.5 font-medium text-[0.625rem]">
                    Out of stock
                  </span>
                )}
              </Link>
              <div className="flex flex-col gap-1">
                <Link
                  className="line-clamp-2 font-medium text-foreground text-sm hover:underline"
                  href={`/watches/${item.slug}`}
                >
                  {item.name}
                </Link>
                <div className="flex items-center justify-between gap-2">
                  <Price
                    compareAtPrice={item.compareAtPrice}
                    price={item.price}
                  />
                  <Button
                    aria-label={`Remove ${item.name} from wishlist`}
                    onClick={() =>
                      removeMutation.mutate({ productId: item.productId })
                    }
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Trash2Icon data-icon />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
