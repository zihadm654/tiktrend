import { SearchXIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { PriceFilter } from "@/components/catalog/price-filter";
import { ProductGrid } from "@/components/product/product-grid";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { catalogHref, parseCatalogFilters } from "@/lib/catalog-params";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";

export const metadata: Metadata = {
  description:
    "Browse the full TikTrend collection — analog, chronograph, automatic, diving, smart, and luxury.",
  title: "All Watches · TikTrend",
};

interface WatchesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WatchesPage({ searchParams }: WatchesPageProps) {
  const params = await searchParams;
  const filters = parseCatalogFilters(params);

  const [categories, { items, pageMeta }] = await Promise.all([
    client.catalog.listCategories(),
    client.catalog.listProducts(filters),
  ]);

  const activeCategoryName = categories.find(
    (category) => category.slug === filters.category
  )?.name;

  const categoryHref = (categorySlug: string | undefined): Route =>
    catalogHref({ ...filters, category: categorySlug, page: 1 });

  const hasActiveFilters =
    filters.category !== undefined ||
    filters.q !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
          {activeCategoryName ?? "All Watches"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {pageMeta.total} timepiece{pageMeta.total === 1 ? "" : "s"}
          {hasActiveFilters
            ? " matching your filters"
            : " — delivered with Cash on Delivery"}
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <h2 className="sr-only">Refine watches</h2>
          <nav aria-label="Categories" className="flex flex-col gap-1">
            <Link
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors",
                filters.category === undefined
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              href={categoryHref(undefined)}
            >
              <span>All Watches</span>
              <span className="text-muted-foreground/70 text-xs tabular-nums">
                {categories.reduce(
                  (total, category) => total + category.productCount,
                  0
                )}
              </span>
            </Link>
            {categories.map((category) => (
              <Link
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors",
                  filters.category === category.slug
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                href={categoryHref(category.slug)}
                key={category.id}
              >
                <span>{category.name}</span>
                <span className="text-muted-foreground/70 text-xs tabular-nums">
                  {category.productCount}
                </span>
              </Link>
            ))}
          </nav>

          <Separator className="my-6" />

          <PriceFilter filters={filters} />
        </aside>

        <section
          aria-label="Product listing"
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CatalogSearch filters={filters} />
            <CatalogSort filters={filters} />
          </div>

          {items.length > 0 ? (
            <>
              <ProductGrid products={items} />
              <CatalogPagination
                filters={filters}
                totalPages={pageMeta.totalPages}
              />
            </>
          ) : (
            <Empty className="min-h-72">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>No watches found</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <EmptyDescription>
                  Try a different search, or browse the full collection.
                </EmptyDescription>
              </EmptyContent>
              <Link
                className="font-medium text-primary text-sm underline-offset-4 hover:underline"
                href="/watches"
              >
                Clear all filters
              </Link>
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}
