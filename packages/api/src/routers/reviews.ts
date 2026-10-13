import { ORPCError } from "@orpc/server";
import { db } from "@tiktrend/db";
import { order, orderItem, product, review, user } from "@tiktrend/db/schema";
import { and, avg, count, desc, eq, inArray } from "drizzle-orm";

import { protectedProcedure, publicProcedure } from "../index";
import {
  createUpdateReviewSchema,
  deleteReviewSchema,
  listReviewsSchema,
  productIdSchema,
  REVIEWS_PAGE_SIZE,
} from "../lib/schemas";

interface ReviewRow {
  comment: string | null;
  createdAt: Date;
  customerId: string;
  customerName: string | null;
  id: string;
  rating: number;
  updatedAt: Date;
}

async function findVerifiedCustomerIds(
  productId: string,
  customerIds: string[]
): Promise<Set<string>> {
  if (customerIds.length === 0) {
    return new Set();
  }

  const rows = await db
    .selectDistinct({ customerId: order.customerId })
    .from(orderItem)
    .innerJoin(order, eq(orderItem.orderId, order.id))
    .where(
      and(
        eq(order.status, "delivered"),
        eq(orderItem.productId, productId),
        inArray(order.customerId, customerIds)
      )
    );

  return new Set(rows.map((row) => row.customerId));
}

function toReviewItem(row: ReviewRow, verified: Set<string>) {
  return {
    comment: row.comment,
    createdAt: row.createdAt,
    customerName: row.customerName ?? "Customer",
    id: row.id,
    rating: row.rating,
    updatedAt: row.updatedAt,
    verifiedPurchase: verified.has(row.customerId),
  };
}

export const reviewsRouter = {
  deleteOwnReview: protectedProcedure
    .input(deleteReviewSchema)
    .handler(async ({ context, input }) => {
      const [existing] = await db
        .select({ customerId: review.customerId, id: review.id })
        .from(review)
        .where(eq(review.id, input.reviewId))
        .limit(1);

      if (!existing || existing.customerId !== context.session.user.id) {
        throw new ORPCError("NOT_FOUND", { message: "Review not found" });
      }

      await db.delete(review).where(eq(review.id, input.reviewId));
      return { deleted: true };
    }),

  getMyReview: protectedProcedure
    .input(productIdSchema)
    .handler(async ({ context, input }) => {
      const [row] = await db
        .select({
          comment: review.comment,
          id: review.id,
          rating: review.rating,
        })
        .from(review)
        .where(
          and(
            eq(review.productId, input.productId),
            eq(review.customerId, context.session.user.id)
          )
        )
        .limit(1);

      return row ?? null;
    }),
  listReviews: publicProcedure
    .input(listReviewsSchema)
    .handler(async ({ input }) => {
      const rows = await db
        .select({
          comment: review.comment,
          createdAt: review.createdAt,
          customerId: review.customerId,
          customerName: user.name,
          id: review.id,
          rating: review.rating,
          updatedAt: review.updatedAt,
        })
        .from(review)
        .innerJoin(user, eq(review.customerId, user.id))
        .where(eq(review.productId, input.productId))
        .orderBy(desc(review.createdAt))
        .limit(REVIEWS_PAGE_SIZE)
        .offset((input.page - 1) * REVIEWS_PAGE_SIZE);

      const [countRow] = await db
        .select({ total: count() })
        .from(review)
        .where(eq(review.productId, input.productId));
      const total = countRow?.total ?? 0;

      const [averageRow] = await db
        .select({ average: avg(review.rating).mapWith(Number) })
        .from(review)
        .where(eq(review.productId, input.productId));

      const verified = await findVerifiedCustomerIds(
        input.productId,
        rows.map((row) => row.customerId)
      );

      return {
        items: rows.map((row) => toReviewItem(row, verified)),
        pageMeta: {
          page: input.page,
          pageSize: REVIEWS_PAGE_SIZE,
          total,
          totalPages: Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE)),
        },
        summary: { average: averageRow?.average ?? null, count: total },
      };
    }),

  // One review per customer per product: create when absent, otherwise update.
  upsertReview: protectedProcedure
    .input(createUpdateReviewSchema)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;

      const [productRow] = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.id, input.productId))
        .limit(1);

      if (!productRow) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const [existing] = await db
        .select({ id: review.id })
        .from(review)
        .where(
          and(
            eq(review.productId, input.productId),
            eq(review.customerId, userId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(review)
          .set({ comment: input.comment || null, rating: input.rating })
          .where(eq(review.id, existing.id));
        return { created: false, id: existing.id };
      }

      const [created] = await db
        .insert(review)
        .values({
          comment: input.comment || null,
          customerId: userId,
          productId: input.productId,
          rating: input.rating,
        })
        .returning({ id: review.id });

      if (!created) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Could not save review.",
        });
      }

      return { created: true, id: created.id };
    }),
};
