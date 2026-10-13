import type { Metadata, Route } from "next";
import Link from "next/link";

import { CategoryShowcase } from "@/components/home/category-showcase";
import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { ProductGrid } from "@/components/product/product-grid";
import { siteConfig } from "@/config/site";
import { client } from "@/utils/orpc";

export const metadata: Metadata = {
  description: siteConfig.description,
  title: siteConfig.brandName,
};

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: Route;
  linkLabel: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-semibold text-xl tracking-tight sm:text-2xl">
        {title}
      </h2>
      <Link
        className="font-medium text-primary text-sm underline-offset-4 hover:underline"
        href={href}
      >
        {linkLabel}
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const home = await client.catalog.listHome();

  return (
    <>
      <Hero />
      <ValueProps />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          href="/watches"
          linkLabel="All watches"
          title="Shop by collection"
        />
        <CategoryShowcase categories={home.categories} />
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader href="/watches" linkLabel="View all" title="Featured" />
        {home.featured.length > 0 ? (
          <ProductGrid products={home.featured} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Featured watches are on the way.
          </p>
        )}
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          href="/watches"
          linkLabel="View all"
          title="New arrivals"
        />
        {home.newArrivals.length > 0 ? (
          <ProductGrid products={home.newArrivals} />
        ) : (
          <p className="text-muted-foreground text-sm">
            New watches arrive soon.
          </p>
        )}
      </section>
    </>
  );
}
