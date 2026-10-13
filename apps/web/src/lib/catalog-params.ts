import type { CatalogSort } from "@tiktrend/api/lib/schemas";
import type { Route } from "next";

export interface CatalogFilters {
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  page: number;
  q?: string;
  sort: CatalogSort;
}

const SORTS: readonly CatalogSort[] = [
  "newest",
  "priceAsc",
  "priceDesc",
  "rating",
  "popular",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? (value[0] ?? undefined) : value;
}

function parseNonNegativeInt(value?: string): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Parse Next.js search params into a validated CatalogFilters object. */
export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>
): CatalogFilters {
  const sortRaw = first(searchParams.sort);
  const sort: CatalogSort = SORTS.includes(sortRaw as CatalogSort)
    ? (sortRaw as CatalogSort)
    : "newest";

  const rawPage = Number.parseInt(first(searchParams.page) ?? "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const category = first(searchParams.category)?.trim() || undefined;
  const q = first(searchParams.q)?.trim() || undefined;

  return {
    category,
    maxPrice: parseNonNegativeInt(first(searchParams.maxPrice)),
    minPrice: parseNonNegativeInt(first(searchParams.minPrice)),
    page,
    q,
    sort,
  };
}

/** Serialize filters into a query-string fragment ("" when empty). */
export function catalogToQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }
  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/** Build a typed `/watches` href so typedRoutes accepts dynamic catalog URLs. */
export function catalogHref(filters: CatalogFilters): Route {
  return `/watches${catalogToQuery(filters)}` as Route;
}

/** Build a typed login href with an optional redirect target. */
export function loginHref(next?: string): Route {
  const params = new URLSearchParams();
  if (next) {
    params.set("next", next);
  }
  const query = params.toString();
  return `/login${query ? `?${query}` : ""}` as Route;
}
