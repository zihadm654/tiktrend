import { ORPCError } from "@orpc/server";
import { db } from "@tiktrend/db";
import { cartItem, product } from "@tiktrend/db/schema";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { protectedProcedure } from "../index";
import { mergeCartLines, resolveAddQuantity } from "../lib/cart";
import {
  addToCartSchema,
  mergeGuestCartSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from "../lib/schemas";

export interface CartLine {
  compareAtPrice: number | null;
  id: string;
  images: string[];
  lineTotal: number;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  slug: string;
  stock: number;
}

export interface Cart {
  items: CartLine[];
  subtotal: number;
}

async function buildCart(userId: string): Promise<Cart> {
  const rows = await db
    .select({
      compareAtPrice: product.compareAtPrice,
      id: cartItem.id,
      images: product.images,
      name: product.name,
      price: product.price,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      slug: product.slug,
      stock: product.stock,
    })
    .from(cartItem)
    .innerJoin(product, eq(cartItem.productId, product.id))
    .where(eq(cartItem.userId, userId))
    .orderBy(asc(cartItem.createdAt));

  const items = rows.map((row) => ({
    ...row,
    lineTotal: row.price * row.quantity,
  }));

  return {
    items,
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
  };
}

/** Returns the product stock, or null when the product doesn't exist. */
async function getStock(productId: string): Promise<number | null> {
  const [row] = await db
    .select({ stock: product.stock })
    .from(product)
    .where(eq(product.id, productId))
    .limit(1);

  return row?.stock ?? null;
}

export const cartRouter = {
  addItem: protectedProcedure
    .input(addToCartSchema)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const stock = await getStock(input.productId);

      if (stock === null) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }
      if (stock <= 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "This product is out of stock",
        });
      }

      const requested = Math.min(input.quantity, stock);

      const [existing] = await db
        .select({ id: cartItem.id, quantity: cartItem.quantity })
        .from(cartItem)
        .where(
          and(
            eq(cartItem.userId, userId),
            eq(cartItem.productId, input.productId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(cartItem)
          .set({
            quantity: resolveAddQuantity(existing.quantity, requested, stock),
          })
          .where(eq(cartItem.id, existing.id));
      } else {
        await db.insert(cartItem).values({
          productId: input.productId,
          quantity: requested,
          userId,
        });
      }

      return buildCart(userId);
    }),

  clearCart: protectedProcedure.handler(async ({ context }) => {
    await db
      .delete(cartItem)
      .where(eq(cartItem.userId, context.session.user.id));
    return buildCart(context.session.user.id);
  }),
  getCart: protectedProcedure.handler(async ({ context }) =>
    buildCart(context.session.user.id)
  ),

  getCartItemCount: protectedProcedure.handler(async ({ context }) => {
    const [row] = await db
      .select({ value: count() })
      .from(cartItem)
      .where(eq(cartItem.userId, context.session.user.id));
    return row?.value ?? 0;
  }),

  mergeGuestCart: protectedProcedure
    .input(mergeGuestCartSchema)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;

      const serverLines = await db
        .select({ productId: cartItem.productId, quantity: cartItem.quantity })
        .from(cartItem)
        .where(eq(cartItem.userId, userId));

      const guestIds = input.items.map((line) => line.productId);
      const stockRows =
        guestIds.length > 0
          ? await db
              .select({ id: product.id, stock: product.stock })
              .from(product)
              .where(inArray(product.id, guestIds))
          : [];

      const stockByProduct = new Map(
        stockRows.map((row) => [row.id, row.stock])
      );
      const merged = mergeCartLines(serverLines, input.items, stockByProduct);

      await db.delete(cartItem).where(eq(cartItem.userId, userId));

      if (merged.size > 0) {
        await db.insert(cartItem).values(
          Array.from(merged.entries()).map(([productId, quantity]) => ({
            productId,
            quantity,
            userId,
          }))
        );
      }

      return buildCart(userId);
    }),

  removeItem: protectedProcedure
    .input(removeCartItemSchema)
    .handler(async ({ context, input }) => {
      await db
        .delete(cartItem)
        .where(
          and(
            eq(cartItem.userId, context.session.user.id),
            eq(cartItem.productId, input.productId)
          )
        );

      return buildCart(context.session.user.id);
    }),

  updateItem: protectedProcedure
    .input(updateCartItemSchema)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const stock = await getStock(input.productId);

      if (stock === null) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }
      if (stock <= 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "This product is out of stock",
        });
      }

      await db
        .update(cartItem)
        .set({ quantity: Math.min(input.quantity, stock) })
        .where(
          and(
            eq(cartItem.userId, userId),
            eq(cartItem.productId, input.productId)
          )
        );

      return buildCart(userId);
    }),
};

export type CartLinePayload = CartLine;
export type CartPayload = Cart;
