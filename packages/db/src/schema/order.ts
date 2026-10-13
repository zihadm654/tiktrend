import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { product } from "./product";

export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const order = pgTable(
  "order",
  {
    address: text("address").notNull(),
    cancelledAt: timestamp("cancelled_at"),
    city: text("city").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    note: text("note"),
    orderCode: text("order_code").notNull().unique(),
    placedAt: timestamp("placed_at").defaultNow().notNull(),
    shippingFee: integer("shipping_fee").default(0).notNull(),
    status: orderStatus("status").default("pending").notNull(),
    subtotal: integer("subtotal").notNull(),
    total: integer("total").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("order_customer_id_idx").on(table.customerId),
    index("order_status_idx").on(table.status),
  ]
);

export const orderItem = pgTable(
  "order_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull(),
    total: integer("total").notNull(),
    unitPrice: integer("unit_price").notNull(),
  },
  (table) => [index("order_item_order_id_idx").on(table.orderId)]
);
