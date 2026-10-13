import { ORPCError } from "@orpc/server";
import { db } from "@tiktrend/db";
import { cartItem, order, orderItem, product } from "@tiktrend/db/schema";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { protectedProcedure } from "../index";
import { checkoutSchema, getOrderSchema } from "../lib/schemas";
import { computeShippingFee } from "../lib/shipping";

/** Order codes avoid look-alike characters but still match /^TT-[A-Z0-9]{6}$/. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateOrderCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (const byte of bytes) {
    suffix += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return `TT-${suffix}`;
}

async function findOrderByCode(orderCode: string) {
  const [row] = await db
    .select()
    .from(order)
    .where(eq(order.orderCode, orderCode))
    .limit(1);
  if (!row) {
    return null;
  }
  const items = await db
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, row.id))
    .orderBy(asc(orderItem.id));
  return { ...row, items };
}

export const ordersRouter = {
  cancelOrder: protectedProcedure
    .input(getOrderSchema)
    .handler(({ context, input }) => {
      const userId = context.session.user.id;

      return db.transaction(async (tx) => {
        const [row] = await tx
          .select()
          .from(order)
          .where(
            and(
              eq(order.orderCode, input.orderCode),
              eq(order.customerId, userId)
            )
          )
          .limit(1);

        if (!row) {
          throw new ORPCError("NOT_FOUND", { message: "Order not found" });
        }

        if (row.status !== "pending") {
          throw new ORPCError("BAD_REQUEST", {
            message: "Only pending orders can be cancelled.",
          });
        }

        const items = await tx
          .select()
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

        await tx
          .update(order)
          .set({ cancelledAt: new Date(), status: "cancelled" })
          .where(eq(order.id, row.id));

        return { orderCode: row.orderCode, status: "cancelled" as const };
      });
    }),

  getOrder: protectedProcedure
    .input(getOrderSchema)
    .handler(async ({ context, input }) => {
      const found = await findOrderByCode(input.orderCode);

      if (!found || found.customerId !== context.session.user.id) {
        throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      }

      return found;
    }),

  listMyOrders: protectedProcedure.handler(async ({ context }) =>
    db
      .select({
        itemCount: sql<number>`count(${orderItem.id})`.mapWith(Number),
        orderCode: order.orderCode,
        placedAt: order.placedAt,
        status: order.status,
        total: order.total,
      })
      .from(order)
      .leftJoin(orderItem, eq(orderItem.orderId, order.id))
      .where(eq(order.customerId, context.session.user.id))
      .groupBy(order.id)
      .orderBy(desc(order.placedAt))
  ),
  placeOrder: protectedProcedure
    .input(checkoutSchema)
    .handler(({ context, input }) => {
      const userId = context.session.user.id;

      return db.transaction(async (tx) => {
        const cartRows = await tx
          .select({
            name: product.name,
            price: product.price,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
          })
          .from(cartItem)
          .innerJoin(product, eq(cartItem.productId, product.id))
          .where(eq(cartItem.userId, userId))
          .orderBy(asc(cartItem.createdAt));

        if (cartRows.length === 0) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Your cart is empty.",
          });
        }

        // Lock the product rows and re-check stock inside the transaction.
        const productIds = cartRows.map((line) => line.productId);
        const stockRows = await tx
          .select({ id: product.id, stock: product.stock })
          .from(product)
          .where(inArray(product.id, productIds))
          .for("update");

        const stockById = new Map(stockRows.map((row) => [row.id, row.stock]));

        for (const line of cartRows) {
          const stock = stockById.get(line.productId) ?? 0;
          if (line.quantity > stock) {
            throw new ORPCError("BAD_REQUEST", {
              message: `Only ${stock} left of ${line.name}. Please update your cart.`,
            });
          }
        }

        const subtotal = cartRows.reduce(
          (total, line) => total + line.price * line.quantity,
          0
        );
        const shippingFee = computeShippingFee(subtotal);

        const candidateCodes = Array.from({ length: 5 }, generateOrderCode);
        const takenCodes = await tx
          .select({ orderCode: order.orderCode })
          .from(order)
          .where(inArray(order.orderCode, candidateCodes));
        const taken = new Set(takenCodes.map((row) => row.orderCode));
        const orderCode = candidateCodes.find((code) => !taken.has(code));
        if (!orderCode) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Could not allocate an order code.",
          });
        }

        const [created] = await tx
          .insert(order)
          .values({
            address: input.address,
            city: input.city,
            customerId: userId,
            customerName: input.name,
            customerPhone: input.phone,
            note: input.note || null,
            orderCode,
            shippingFee,
            status: "pending",
            subtotal,
            total: subtotal + shippingFee,
          })
          .returning({ id: order.id, orderCode: order.orderCode });

        if (!created) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Could not place the order.",
          });
        }

        await tx.insert(orderItem).values(
          cartRows.map((line) => ({
            name: line.name,
            orderId: created.id,
            productId: line.productId,
            quantity: line.quantity,
            total: line.price * line.quantity,
            unitPrice: line.price,
          }))
        );

        for (const line of cartRows) {
          // biome-ignore lint/performance/noAwaitInLoops: stock decrement is intentionally sequential inside the transaction
          await tx
            .update(product)
            .set({ stock: sql`${product.stock} - ${line.quantity}` })
            .where(eq(product.id, line.productId));
        }

        await tx.delete(cartItem).where(eq(cartItem.userId, userId));

        return { orderCode: created.orderCode, total: subtotal + shippingFee };
      });
    }),
};
