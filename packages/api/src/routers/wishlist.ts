import { db } from "@tiktrend/db";
import { product, wishlistItem } from "@tiktrend/db/schema";
import { and, asc, eq, gt } from "drizzle-orm";
import { protectedProcedure } from "../index";
import { wishlistToggleSchema } from "../lib/schemas";

export const wishlistRouter = {
  getWishlist: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const rows = await db
      .select({
        addedAt: wishlistItem.createdAt,
        compareAtPrice: product.compareAtPrice,
        images: product.images,
        inStock: gt(product.stock, 0),
        name: product.name,
        price: product.price,
        productId: product.id,
        slug: product.slug,
        stock: product.stock,
      })
      .from(wishlistItem)
      .innerJoin(product, eq(wishlistItem.productId, product.id))
      .where(eq(wishlistItem.userId, userId))
      .orderBy(asc(wishlistItem.createdAt));

    return rows;
  }),

  getWishlistIds: protectedProcedure.handler(async ({ context }) => {
    const rows = await db
      .select({ productId: wishlistItem.productId })
      .from(wishlistItem)
      .where(eq(wishlistItem.userId, context.session.user.id));
    return rows.map((row) => row.productId);
  }),

  toggle: protectedProcedure
    .input(wishlistToggleSchema)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;

      const [existing] = await db
        .select({ id: wishlistItem.id })
        .from(wishlistItem)
        .where(
          and(
            eq(wishlistItem.userId, userId),
            eq(wishlistItem.productId, input.productId)
          )
        )
        .limit(1);

      if (existing) {
        await db.delete(wishlistItem).where(eq(wishlistItem.id, existing.id));
        return { inWishlist: false };
      }

      const [productRow] = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.id, input.productId))
        .limit(1);

      if (!productRow) {
        return { inWishlist: false };
      }

      await db.insert(wishlistItem).values({
        productId: input.productId,
        userId,
      });

      return { inWishlist: true };
    }),
};
