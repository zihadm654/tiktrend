import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductBuyPanel } from "@/components/product/product-buy-panel";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { RatingStars } from "@/components/product/rating-stars";
import { ReviewSection } from "@/components/review/review-section";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { client } from "@/utils/orpc";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await client.catalog.getProductBySlug({ slug });
    return {
      description: product.description,
      title: `${product.name} · TikTrend`,
    };
  } catch {
    return { title: "Watch not found · TikTrend" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await client.catalog
    .getProductBySlug({ slug })
    .catch(() => notFound());

  const related = await client.catalog.relatedProducts({
    productId: product.id,
  });
  const attributeEntries = Object.entries(product.attributes);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/watches" />}>
              Watches
            </BreadcrumbLink>
          </BreadcrumbItem>
          {product.category.slug ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <Link
                      href={{
                        pathname: "/watches",
                        query: { category: product.category.slug ?? undefined },
                      }}
                    />
                  }
                >
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery alt={product.name} images={product.images} />

        <div className="flex flex-col gap-6 lg:pt-2">
          <div className="flex flex-col gap-3">
            {product.featured ? (
              <Badge className="w-fit" variant="secondary">
                Featured
              </Badge>
            ) : null}
            <h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <RatingStars rating={product.rating} />
          </div>

          <Separator />

          <ProductBuyPanel
            compareAtPrice={product.compareAtPrice}
            inStock={product.inStock}
            name={product.name}
            price={product.price}
            productId={product.id}
            stock={product.stock}
          />

          <Separator />

          <div className="flex flex-col gap-3">
            <h2 className="font-semibold text-sm tracking-tight">
              Description
            </h2>
            <p className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {attributeEntries.length > 0 ? (
            <>
              <Separator />
              <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-sm tracking-tight">
                  Specifications
                </h2>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {attributeEntries.map(([key, value]) => (
                    <div
                      className="flex flex-col gap-0.5 border-b py-2"
                      key={key}
                    >
                      <dt className="text-muted-foreground text-xs">{key}</dt>
                      <dd className="font-medium text-foreground text-sm">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <Separator />

      <ReviewSection productId={product.id} slug={product.slug} />

      {related.length > 0 ? (
        <section aria-label="Related watches" className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-semibold text-xl tracking-tight">
              You may also like
            </h2>
            <Link
              className="font-medium text-primary text-sm underline-offset-4 hover:underline"
              href={{
                pathname: "/watches",
                query: { category: product.category.slug ?? undefined },
              }}
            >
              View all
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
