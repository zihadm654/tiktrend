import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMAGE =
  "https://picsum.photos/seed/collection-placeholder/800/800";

interface CategorySummary {
  id: string;
  image: string | null;
  name: string;
  productCount: number;
  slug: string;
}

export function CategoryShowcase({
  categories,
}: {
  categories: CategorySummary[];
}) {
  return (
    <div className="scroll-mt-20" id="categories">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            className="group flex h-full flex-col gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            href={{ pathname: "/watches", query: { category: category.slug } }}
            key={category.id}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                alt={category.name}
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                src={category.image ?? FALLBACK_IMAGE}
              />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-medium text-foreground text-sm">
                {category.name}
              </h3>
              <span className="text-muted-foreground text-xs tabular-nums">
                {category.productCount}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
