import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const category = pgTable("category", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description"),
  id: uuid("id").defaultRandom().primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
