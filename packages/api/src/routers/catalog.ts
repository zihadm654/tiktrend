import { ORPCError } from "@orpc/server";
import { db } from "@tiktrend/db";
import {
  category,
  order,
  orderItem,
  product,
  review,
} from "@tiktrend/db/schema";
import type { SQL } from "drizzle-orm";
import {
  and,
  asc,
  avg,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  or,
  sql,
  sum,
} from "drizzle-orm";

import { publicProcedure } from "../index";
import {
  CATALOG_PAGE_SIZE,
  getProductBySlugSchema,
  getProductsByIdsSchema,
  listProductsSchema,
  relatedProductsSchema,
} from "../lib/schemas";

interface RatingSummary {
  average: number | null;
  count: number;
}

interface CatalogRow {
  category: typeof category.$inferSelect | null;
  product: typeof product.$inferSelect;
}

interface CatalogItem {
  categoryName: string | null;
  categorySlug: string | null;
  compareAtPrice: number | null;
  featured: boolean;
  id: string;
  images: string[];
  inStock: boolean;
  name: string;
  price: number;
  rating: RatingSummary;
  slug: string;
  stock: number;
}

function toCatalogItem(
  row: CatalogRow,
  ratings: Map<string, RatingSummary>
): CatalogItem {
  return {
    categoryName: row.category?.name ?? null,
    categorySlug: row.category?.slug ?? null,
    compareAtPrice: row.product.compareAtPrice,
    featured: row.product.featured,
    id: row.product.id,
    images: row.product.images,
    inStock: row.product.stock > 0,
    name: row.product.name,
    price: row.product.price,
    rating: ratings.get(row.product.id) ?? { average: null, count: 0 },
    slug: row.product.slug,
    stock: row.product.stock,
  };
}

async function getRatingsMap(
  productIds: string[]
): Promise<Map<string, RatingSummary>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      average: avg(review.rating).mapWith(Number),
      count: count(),
      productId: review.productId,
    })
    .from(review)
    .where(inArray(review.productId, productIds))
    .groupBy(review.productId);

  return new Map(
    rows.map((row) => [
      row.productId,
      { average: row.average, count: row.count },
    ])
  );
}

// Quantity of each product sold in Delivered orders — the "popular" sort metric.
const popularity = db
  .select({
    productId: orderItem.productId,
    sold: sum(orderItem.quantity).mapWith(Number).as("sold"),
  })
  .from(orderItem)
  .innerJoin(order, eq(orderItem.orderId, order.id))
  .where(eq(order.status, "delivered"))
  .groupBy(orderItem.productId)
  .as("order_item_popularity");

// Average review rating per product, for the "rating" sort metric.
const ratingsSubquery = db
  .select({
    average: avg(review.rating).mapWith(Number).as("average"),
    productId: review.productId,
  })
  .from(review)
  .groupBy(review.productId)
  .as("product_rating");

export const catalogRouter = {
  getProductBySlug: publicProcedure
    .input(getProductBySlugSchema)
    .handler(async ({ input }) => {
      const [row] = await db
        .select({ category, product })
        .from(product)
        .leftJoin(category, eq(product.categoryId, category.id))
        .where(eq(product.slug, input.slug))
        .limit(1);

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const ratings = await getRatingsMap([row.product.id]);
      const rating = ratings.get(row.product.id) ?? { average: null, count: 0 };

      return {
        attributes: row.product.attributes,
        category: {
          id: row.product.categoryId,
          name: row.category?.name ?? null,
          slug: row.category?.slug ?? null,
        },
        compareAtPrice: row.product.compareAtPrice,
        description: row.product.description,
        featured: row.product.featured,
        id: row.product.id,
        images: row.product.images,
        inStock: row.product.stock > 0,
        name: row.product.name,
        price: row.product.price,
        rating,
        slug: row.product.slug,
        stock: row.product.stock,
      };
    }),

  getProductsByIds: publicProcedure
    .input(getProductsByIdsSchema)
    .handler(async ({ input }) => {
      if (input.ids.length === 0) {
        return [];
      }

      const rows = await db
        .select({ category, product })
        .from(product)
        .leftJoin(category, eq(product.categoryId, category.id))
        .where(inArray(product.id, input.ids));

      const ratings = await getRatingsMap(rows.map((row) => row.product.id));
      return rows.map((row) => toCatalogItem(row, ratings));
    }),
  listCategories: publicProcedure.handler(async () =>
    db
      .select({
        id: category.id,
        image: category.image,
        name: category.name,
        productCount: count(),
        slug: category.slug,
      })
      .from(category)
      .leftJoin(product, eq(product.categoryId, category.id))
      .groupBy(category.id)
      .orderBy(asc(category.sortOrder), asc(category.name))
  ),

  // The homepage aggregates live in one procedure so a single RPC round-trip loads the page.
  listHome: publicProcedure.handler(async () => {
    const [categories, featured, newArrivals] = await Promise.all([
      db
        .select({
          id: category.id,
          image: category.image,
          name: category.name,
          productCount: count(),
          slug: category.slug,
        })
        .from(category)
        .leftJoin(product, eq(product.categoryId, category.id))
        .groupBy(category.id)
        .orderBy(asc(category.sortOrder), asc(category.name)),
      db
        .select({ category, product })
        .from(product)
        .leftJoin(category, eq(product.categoryId, category.id))
        .where(eq(product.featured, true))
        .orderBy(desc(product.createdAt))
        .limit(8),
      db
        .select({ category, product })
        .from(product)
        .leftJoin(category, eq(product.categoryId, category.id))
        .orderBy(desc(product.createdAt))
        .limit(8),
    ]);

    const [featuredRatings, newRatings] = await Promise.all([
      getRatingsMap(featured.map((row) => row.product.id)),
      getRatingsMap(newArrivals.map((row) => row.product.id)),
    ]);

    return {
      categories,
      featured: featured.map((row) => toCatalogItem(row, featuredRatings)),
      newArrivals: newArrivals.map((row) => toCatalogItem(row, newRatings)),
    };
  }),

  listProducts: publicProcedure
    .input(listProductsSchema)
    .handler(async ({ input }) => {
      const conditions: SQL[] = [];

      if (input.category) {
        const [cat] = await db
          .select()
          .from(category)
          .where(eq(category.slug, input.category))
          .limit(1);
        if (!cat) {
          throw new ORPCError("NOT_FOUND", {
            message: `Category "${input.category}" not found`,
          });
        }
        conditions.push(eq(product.categoryId, cat.id));
      }

      if (input.q) {
        const q = `%${input.q}%`;
        const searchCondition = or(
          ilike(product.name, q),
          ilike(product.description, q)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      if (input.minPrice !== undefined) {
        conditions.push(gte(product.price, input.minPrice));
      }

      if (input.maxPrice !== undefined) {
        conditions.push(lte(product.price, input.maxPrice));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const orderBy: SQL[] = (() => {
        switch (input.sort) {
          case "priceAsc":
            return [asc(product.price)];
          case "priceDesc":
            return [desc(product.price)];
          case "popular":
            return [
              sql`${popularity.sold} DESC NULLS LAST`,
              desc(product.createdAt),
            ];
          case "rating":
            return [
              sql`${ratingsSubquery.average} DESC NULLS LAST`,
              desc(product.createdAt),
            ];
          default:
            return [desc(product.createdAt)];
        }
      })();

      const rows = await db
        .select({ category, product })
        .from(product)
        .leftJoin(category, eq(product.categoryId, category.id))
        .leftJoin(popularity, eq(product.id, popularity.productId))
        .leftJoin(ratingsSubquery, eq(product.id, ratingsSubquery.productId))
        .where(where)
        .orderBy(...orderBy)
        .limit(CATALOG_PAGE_SIZE)
        .offset((input.page - 1) * CATALOG_PAGE_SIZE);

      const [countRow] = await db
        .select({ total: count() })
        .from(product)
        .where(where);
      const total = countRow?.total ?? 0;

      const ratings = await getRatingsMap(rows.map((row) => row.product.id));

      return {
        items: rows.map((row) => toCatalogItem(row, ratings)),
        pageMeta: {
          page: input.page,
          pageSize: CATALOG_PAGE_SIZE,
          total,
          totalPages: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
        },
      };
    }),

  relatedProducts: publicProcedure
    .input(relatedProductsSchema)
    .handler(async ({ input }) => {
      const [current] = await db
        .select({ categoryId: product.categoryId })
        .from(product)
        .where(eq(product.id, input.productId))
        .limit(1);

      if (!current) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const rows = await db
        .select({ category, product })
        .from(product)
        .leftJoin(category, eq(product.categoryId, category.id))
        .where(
          and(
            eq(product.categoryId, current.categoryId),
            ne(product.id, input.productId)
          )
        )
        .orderBy(desc(product.createdAt))
        .limit(4);

      const ratings = await getRatingsMap(rows.map((row) => row.product.id));
      return rows.map((row) => toCatalogItem(row, ratings));
    }),
};

export type { CatalogItem, CatalogRow, RatingSummary };
