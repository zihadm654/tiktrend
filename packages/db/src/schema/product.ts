import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { category } from "./category";

export const product = pgTable(
  "product",
  {
    attributes: jsonb("attributes")
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),
    compareAtPrice: integer("compare_at_price"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    description: text("description").notNull(),
    featured: boolean("featured").default(false).notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    images: jsonb("images").$type<string[]>().default([]).notNull(),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    sku: text("sku").notNull().unique(),
    slug: text("slug").notNull().unique(),
    stock: integer("stock").default(0).notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_category_id_idx").on(table.categoryId),
    index("product_featured_idx").on(table.featured),
  ]
);
