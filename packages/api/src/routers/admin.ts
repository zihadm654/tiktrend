import { ORPCError } from "@orpc/server";
import { db } from "@tiktrend/db";
import {
  category,
  order,
  orderItem,
  product,
  review,
  user,
} from "@tiktrend/db/schema";
import { asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { adminProcedure } from "../index";
import type { OrderStatus } from "../lib/schemas";
import {
  ADMIN_PAGE_SIZE,
  adminListProductsSchema,
  adminListReviewsSchema,
  categoryIdSchema,
  categoryUpdateSchema,
  categoryWriteSchema,
  deleteReviewSchema,
  getOrderSchema,
  listAdminOrdersSchema,
  productIdSchema,
  productUpdateSchema,
  productWriteSchema,
  updateOrderStatusSchema,
} from "../lib/schemas";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function randomSuffix(length = 4): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) {
    out += alphabet[byte % alphabet.length];
  }
  return out;
}

async function uniqueProductSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const root = base || "watch";
  const candidates = [
    root,
    ...Array.from({ length: 49 }, (_, index) => `${root}-${index + 2}`),
  ];
  const rows = await db
    .select({ id: product.id, slug: product.slug })
    .from(product)
    .where(inArray(product.slug, candidates));
  const taken = new Set(
    rows.filter((row) => row.id !== excludeId).map((row) => row.slug)
  );
  const free = candidates.find((candidate) => !taken.has(candidate));
  return free ?? `${root}-${randomSuffix(6)}`;
}

async function uniqueCategorySlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const root = base || "collection";
  const candidates = [
    root,
    ...Array.from({ length: 49 }, (_, index) => `${root}-${index + 2}`),
  ];
  const rows = await db
    .select({ id: category.id, slug: category.slug })
    .from(category)
    .where(inArray(category.slug, candidates));
  const taken = new Set(
    rows.filter((row) => row.id !== excludeId).map((row) => row.slug)
  );
  const free = candidates.find((candidate) => !taken.has(candidate));
  return free ?? `${root}-${randomSuffix(6)}`;
}

async function uniqueSku(base: string, excludeId?: string): Promise<string> {
  const root = `TT-${(slugify(base) || "watch").toUpperCase().slice(0, 24)}`;
  const candidates = Array.from(
    { length: 50 },
    () => `${root}-${randomSuffix(5)}`
  );
  const rows = await db
    .select({ id: product.id, sku: product.sku })
    .from(product)
    .where(inArray(product.sku, candidates));
  const taken = new Set(
    rows.filter((row) => row.id !== excludeId).map((row) => row.sku)
  );
  const free = candidates.find((candidate) => !taken.has(candidate));
  return free ?? `${root}-${randomSuffix(8)}`;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  cancelled: [],
  confirmed: ["shipped", "cancelled"],
  delivered: [],
  pending: ["confirmed", "cancelled"],
  shipped: ["delivered", "cancelled"],
};

export const adminRouter = {
  createCategory: adminProcedure
    .input(categoryWriteSchema)
    .handler(async ({ input }) => {
      const slug = await uniqueCategorySlug(input.slug ?? slugify(input.name));
      const [created] = await db
        .insert(category)
        .values({
          description: input.description ?? null,
          image: input.image ?? null,
          name: input.name,
          slug,
          sortOrder: input.sortOrder,
        })
        .returning({ id: category.id, slug: category.slug });
      return created;
    }),

  createProduct: adminProcedure
    .input(productWriteSchema)
    .handler(async ({ input }) => {
      const [categoryRow] = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.id, input.categoryId))
        .limit(1);
      if (!categoryRow) {
        throw new ORPCError("BAD_REQUEST", { message: "Category not found" });
      }

      const slug = await uniqueProductSlug(input.slug ?? slugify(input.name));
      const sku = input.sku ?? (await uniqueSku(input.name));

      const [created] = await db
        .insert(product)
        .values({
          attributes: input.attributes,
          categoryId: input.categoryId,
          compareAtPrice: input.compareAtPrice ?? null,
          description: input.description,
          featured: input.featured,
          images: input.images,
          name: input.name,
          price: input.price,
          sku,
          slug,
          stock: input.stock,
        })
        .returning({ id: product.id, slug: product.slug });

      return created;
    }),

  deleteCategory: adminProcedure
    .input(categoryIdSchema)
    .handler(async ({ input }) => {
      const [countRow] = await db
        .select({ total: count() })
        .from(product)
        .where(eq(product.categoryId, input.categoryId));
      if ((countRow?.total ?? 0) > 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Move or delete this category's products first.",
        });
      }
      await db.delete(category).where(eq(category.id, input.categoryId));
      return { deleted: true };
    }),

  deleteProduct: adminProcedure
    .input(productIdSchema)
    .handler(async ({ input }) => {
      const [existing] = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.id, input.productId))
        .limit(1);
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }
      await db.delete(product).where(eq(product.id, input.productId));
      return { deleted: true };
    }),

  deleteReview: adminProcedure
    .input(deleteReviewSchema)
    .handler(async ({ input }) => {
      await db.delete(review).where(eq(review.id, input.reviewId));
      return { deleted: true };
    }),

  getOrder: adminProcedure.input(getOrderSchema).handler(async ({ input }) => {
    const [row] = await db
      .select({
        address: order.address,
        cancelledAt: order.cancelledAt,
        city: order.city,
        customerEmail: user.email,
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        id: order.id,
        note: order.note,
        orderCode: order.orderCode,
        placedAt: order.placedAt,
        shippingFee: order.shippingFee,
        status: order.status,
        subtotal: order.subtotal,
        total: order.total,
      })
      .from(order)
      .leftJoin(user, eq(order.customerId, user.id))
      .where(eq(order.orderCode, input.orderCode))
      .limit(1);

    if (!row) {
      throw new ORPCError("NOT_FOUND", { message: "Order not found" });
    }

    const items = await db
      .select({
        id: orderItem.id,
        name: orderItem.name,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        total: orderItem.total,
        unitPrice: orderItem.unitPrice,
      })
      .from(orderItem)
      .where(eq(orderItem.orderId, row.id))
      .orderBy(asc(orderItem.id));

    return { ...row, items };
  }),

  getProduct: adminProcedure
    .input(productIdSchema)
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(product)
        .where(eq(product.id, input.productId))
        .limit(1);
      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }
      return row;
    }),

  // --- Categories -------------------------------------------------------
  listCategories: adminProcedure.handler(async () =>
    db
      .select({
        description: category.description,
        id: category.id,
        image: category.image,
        name: category.name,
        productCount: count(product.id),
        slug: category.slug,
        sortOrder: category.sortOrder,
      })
      .from(category)
      .leftJoin(product, eq(product.categoryId, category.id))
      .groupBy(category.id)
      .orderBy(asc(category.sortOrder), asc(category.name))
  ),

  listCategoryOptions: adminProcedure.handler(async () =>
    db
      .select({ id: category.id, name: category.name })
      .from(category)
      .orderBy(asc(category.sortOrder), asc(category.name))
  ),

  listOrders: adminProcedure
    .input(listAdminOrdersSchema)
    .handler(async ({ input }) => {
      const where = input.status ? eq(order.status, input.status) : undefined;

      const rows = await db
        .select({
          city: order.city,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          itemCount: sql<number>`count(${orderItem.id})`.mapWith(Number),
          orderCode: order.orderCode,
          placedAt: order.placedAt,
          status: order.status,
          total: order.total,
        })
        .from(order)
        .leftJoin(orderItem, eq(orderItem.orderId, order.id))
        .where(where)
        .groupBy(order.id)
        .orderBy(desc(order.placedAt))
        .limit(ADMIN_PAGE_SIZE)
        .offset((input.page - 1) * ADMIN_PAGE_SIZE);

      const [countRow] = await db
        .select({ total: count() })
        .from(order)
        .where(where);
      const total = countRow?.total ?? 0;

      return {
        items: rows,
        pageMeta: {
          page: input.page,
          pageSize: ADMIN_PAGE_SIZE,
          total,
          totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
        },
      };
    }),
  // --- Products ---------------------------------------------------------
  listProducts: adminProcedure
    .input(adminListProductsSchema)
    .handler(async ({ input }) => {
      const search = input.q ? `%${input.q}%` : undefined;
      const where = search
        ? or(
            ilike(product.name, search),
            ilike(product.sku, search),
            ilike(product.slug, search)
          )
        : undefined;

      const rows = await db
        .select({
          categoryName: category.name,
          createdAt: product.createdAt,
          featured: product.featured,
          id: product.id,
          images: product.images,
          name: product.name,
          price: product.price,
          sku: product.sku,
          slug: product.slug,
          stock: product.stock,
        })
        .from(product)
        .leftJoin(category, eq(product.categoryId, category.id))
        .where(where)
        .orderBy(desc(product.createdAt))
        .limit(ADMIN_PAGE_SIZE)
        .offset((input.page - 1) * ADMIN_PAGE_SIZE);

      const [countRow] = await db
        .select({ total: count() })
        .from(product)
        .where(where);
      const total = countRow?.total ?? 0;

      return {
        items: rows,
        pageMeta: {
          page: input.page,
          pageSize: ADMIN_PAGE_SIZE,
          total,
          totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
        },
      };
    }),

  // --- Reviews ----------------------------------------------------------
  listReviews: adminProcedure
    .input(adminListReviewsSchema)
    .handler(async ({ input }) => {
      const rows = await db
        .select({
          comment: review.comment,
          createdAt: review.createdAt,
          customerEmail: user.email,
          customerName: user.name,
          id: review.id,
          productName: product.name,
          productSlug: product.slug,
          rating: review.rating,
        })
        .from(review)
        .innerJoin(product, eq(review.productId, product.id))
        .innerJoin(user, eq(review.customerId, user.id))
        .orderBy(desc(review.createdAt))
        .limit(ADMIN_PAGE_SIZE)
        .offset((input.page - 1) * ADMIN_PAGE_SIZE);

      const [countRow] = await db.select({ total: count() }).from(review);
      const total = countRow?.total ?? 0;

      return {
        items: rows,
        pageMeta: {
          page: input.page,
          pageSize: ADMIN_PAGE_SIZE,
          total,
          totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
        },
      };
    }),

  // --- Orders -----------------------------------------------------------
  stats: adminProcedure.handler(async () => {
    const rows = await db
      .select({ status: order.status, total: count() })
      .from(order)
      .groupBy(order.status);

    const counts: Record<OrderStatus, number> = {
      cancelled: 0,
      confirmed: 0,
      delivered: 0,
      pending: 0,
      shipped: 0,
    };
    for (const row of rows) {
      counts[row.status] = row.total;
    }
    return counts;
  }),

  updateCategory: adminProcedure
    .input(categoryUpdateSchema)
    .handler(async ({ input }) => {
      const [existing] = await db
        .select({ id: category.id, slug: category.slug })
        .from(category)
        .where(eq(category.id, input.categoryId))
        .limit(1);
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }

      const slug = input.slug
        ? await uniqueCategorySlug(input.slug, existing.id)
        : existing.slug;

      await db
        .update(category)
        .set({
          ...(input.description === undefined
            ? {}
            : { description: input.description }),
          ...(input.image === undefined ? {} : { image: input.image }),
          ...(input.name ? { name: input.name } : {}),
          ...(input.sortOrder === undefined
            ? {}
            : { sortOrder: input.sortOrder }),
          slug,
        })
        .where(eq(category.id, existing.id));

      return { id: existing.id };
    }),

  updateOrderStatus: adminProcedure
    .input(updateOrderStatusSchema)
    .handler(async ({ input }) =>
      db.transaction(async (tx) => {
        const [row] = await tx
          .select({
            id: order.id,
            orderCode: order.orderCode,
            status: order.status,
          })
          .from(order)
          .where(eq(order.orderCode, input.orderCode))
          .limit(1);

        if (!row) {
          throw new ORPCError("NOT_FOUND", { message: "Order not found" });
        }

        if (row.status === input.status) {
          return { orderCode: row.orderCode, status: row.status };
        }

        const allowed = ALLOWED_TRANSITIONS[row.status];
        if (!allowed.includes(input.status)) {
          throw new ORPCError("BAD_REQUEST", {
            message: `Cannot move an order from ${row.status} to ${input.status}.`,
          });
        }

        if (input.status === "cancelled") {
          const items = await tx
            .select({
              productId: orderItem.productId,
              quantity: orderItem.quantity,
            })
            .from(orderItem)
            .where(eq(orderItem.orderId, row.id));

          for (const item of items) {
            if (item.productId) {
              // biome-ignore lint/performance/noAwaitInLoops: stock restoration is intentionally sequential inside the transaction
              await tx
                .update(product)
                .set({ stock: sql`${product.stock} + ${item.quantity}` })
                .where(eq(product.id, item.productId));
            }
          }
        }

        await tx
          .update(order)
          .set({
            status: input.status,
            ...(input.status === "cancelled"
              ? { cancelledAt: new Date() }
              : {}),
          })
          .where(eq(order.id, row.id));

        return { orderCode: row.orderCode, status: input.status };
      })
    ),

  updateProduct: adminProcedure
    .input(productUpdateSchema)
    .handler(async ({ input }) => {
      const [existing] = await db
        .select({ id: product.id, sku: product.sku, slug: product.slug })
        .from(product)
        .where(eq(product.id, input.productId))
        .limit(1);
      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      if (input.categoryId) {
        const [categoryRow] = await db
          .select({ id: category.id })
          .from(category)
          .where(eq(category.id, input.categoryId))
          .limit(1);
        if (!categoryRow) {
          throw new ORPCError("BAD_REQUEST", { message: "Category not found" });
        }
      }

      const slug = input.slug
        ? await uniqueProductSlug(input.slug, existing.id)
        : existing.slug;
      const sku = input.sku
        ? await uniqueSku(input.sku, existing.id)
        : existing.sku;

      await db
        .update(product)
        .set({
          ...(input.attributes ? { attributes: input.attributes } : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.compareAtPrice === undefined
            ? {}
            : { compareAtPrice: input.compareAtPrice }),
          ...(input.description ? { description: input.description } : {}),
          ...(input.featured === undefined ? {} : { featured: input.featured }),
          ...(input.images ? { images: input.images } : {}),
          ...(input.name ? { name: input.name } : {}),
          ...(input.price === undefined ? {} : { price: input.price }),
          ...(input.stock === undefined ? {} : { stock: input.stock }),
          sku,
          slug,
        })
        .where(eq(product.id, existing.id));

      return { id: existing.id };
    }),
};
