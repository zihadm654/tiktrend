import type { CatalogItem } from "@tiktrend/api/routers/catalog";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Price } from "./price";
import { RatingStars } from "./rating-stars";
import { WishlistButton } from "./wishlist-button";

const FALLBACK_IMAGE = "https://picsum.photos/seed/watch-placeholder/800/800";

interface ProductCardProps {
  priority?: boolean;
  product: CatalogItem;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const onSale =
    product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPct =
    onSale && product.compareAtPrice !== null
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : 0;

  return (
    <div className="group relative flex h-full flex-col gap-3 rounded-2xl">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          alt={product.name}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          src={product.images[0] ?? FALLBACK_IMAGE}
        />

        {product.inStock ? null : (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <Badge variant="secondary">Out of stock</Badge>
          </div>
        )}

        {product.inStock && onSale ? (
          <Badge className="absolute top-2 left-2" variant="destructive">
            -{discountPct}%
          </Badge>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-col gap-1">
        {product.categoryName ? (
          <span className="font-medium text-[0.6875rem] text-muted-foreground uppercase tracking-wide">
            {product.categoryName}
          </span>
        ) : null}
        <h3 className="line-clamp-2 font-medium text-foreground text-sm">
          {product.name}
        </h3>
        <div className="mt-1">
          <Price
            compareAtPrice={product.compareAtPrice}
            price={product.price}
          />
        </div>
        <RatingStars rating={product.rating} />
      </div>

      {/* Stretched link keeps the whole card navigable. */}
      <Link
        aria-label={product.name}
        className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        href={`/watches/${product.slug}`}
      />

      <WishlistButton
        className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur"
        productId={product.id}
      />
    </div>
  );
}
