import type { CatalogItem } from "@tiktrend/api/routers/catalog";

import { cn } from "@/lib/utils";

import { ProductCard } from "./product-card";

interface ProductGridProps {
  className?: string;
  priorityPages?: number;
  products: CatalogItem[];
}

export function ProductGrid({
  products,
  className,
  priorityPages = 1,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          priority={index < priorityPages * 4}
          product={product}
        />
      ))}
    </div>
  );
}
