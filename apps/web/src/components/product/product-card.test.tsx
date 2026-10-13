import { render, screen } from "@testing-library/react";
import type { CatalogItem } from "@tiktrend/api/routers/catalog";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProductCard } from "./product-card";

const DISCOUNT_PATTERN = /^-\d+%$/;

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // biome-ignore lint/performance/noImgElement: lightweight stub for next/image in tests
    <img alt={alt} height={800} src={src} width={800} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children?: ReactNode;
    href: string;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("./wishlist-button", () => ({ WishlistButton: () => null }));

function makeProduct(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    categoryName: "Dive",
    categorySlug: "dive",
    compareAtPrice: null,
    featured: false,
    id: "11111111-1111-1111-1111-111111111111",
    images: ["https://picsum.photos/seed/diver/800/800"],
    inStock: true,
    name: "Dive Master",
    price: 1_500_000,
    rating: { average: null, count: 0 },
    slug: "dive-master",
    stock: 10,
    ...overrides,
  };
}

describe("ProductCard", () => {
  it("renders the name, category, and price", () => {
    render(<ProductCard product={makeProduct()} />);

    expect(screen.getByText("Dive Master")).toBeTruthy();
    expect(screen.getByText("Dive")).toBeTruthy();
    expect(screen.getByText("৳15,000")).toBeTruthy();
  });

  it("links to the product detail page", () => {
    render(<ProductCard product={makeProduct()} />);

    const link = screen.getByRole("link", { name: "Dive Master" });
    expect(link.getAttribute("href")).toBe("/watches/dive-master");
  });

  it("shows a discount badge when compareAtPrice is higher", () => {
    render(
      <ProductCard
        product={makeProduct({ compareAtPrice: 2_000_000, price: 1_500_000 })}
      />
    );

    expect(screen.getByText("-25%")).toBeTruthy();
  });

  it("hides the discount badge when there is no sale", () => {
    render(<ProductCard product={makeProduct()} />);

    expect(screen.queryByText(DISCOUNT_PATTERN)).toBeNull();
  });

  it("shows an out-of-stock overlay when unavailable", () => {
    render(<ProductCard product={makeProduct({ inStock: false, stock: 0 })} />);

    expect(screen.getByText("Out of stock")).toBeTruthy();
  });
});
