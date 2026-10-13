import { z } from "zod";

/** Number of products rendered per catalog page. */
export const CATALOG_PAGE_SIZE = 12;

/** A Bangladesh mobile number: 01XXXXXXXXX, +8801XXXXXXXXX, or 8801XXXXXXXXX. */
export const bdPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+?880|0)?1[3-9]\d{8}$/,
    "Enter a valid Bangladesh mobile number."
  );

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

/** Human-readable order references are short random codes, e.g. TT-7F3K2Q. */
export const orderCodeSchema = z
  .string()
  .regex(/^TT-[A-Z0-9]{6}$/, "Malformed order code");

const idSchema = z.string().uuid();

export const listCategoriesSchema = z.object({});

/** Catalog sort options, shared by the API and the web toolbar. */
export const catalogSortSchema = z.enum([
  "newest",
  "priceAsc",
  "priceDesc",
  "rating",
  "popular",
]);
export type CatalogSort = z.infer<typeof catalogSortSchema>;

export const listProductsSchema = z.object({
  category: z.string().trim().min(1).max(50).optional(),
  maxPrice: z.number().int().min(0).optional(),
  minPrice: z.number().int().min(0).optional(),
  page: z.number().int().min(1).default(1),
  q: z.string().trim().max(100).optional(),
  sort: catalogSortSchema.default("newest"),
});
export type ListProductsInput = z.infer<typeof listProductsSchema>;

export const getProductBySlugSchema = z.object({
  slug: z.string().trim().min(1).max(100),
});

export const relatedProductsSchema = z.object({
  productId: idSchema,
});

export const getProductsByIdsSchema = z.object({
  ids: z.array(idSchema).max(50),
});

export const addToCartSchema = z.object({
  productId: idSchema,
  quantity: z.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  productId: idSchema,
  quantity: z.number().int().min(1).max(99),
});

export const removeCartItemSchema = z.object({
  productId: idSchema,
});

export const wishlistToggleSchema = z.object({
  productId: idSchema,
});

export const pageSchema = z.object({
  page: z.number().int().min(1).default(1),
});

export const checkoutSchema = z.object({
  address: z.string().trim().min(5).max(300, "Full address is required."),
  city: z.string().trim().min(2).max(80, "City is required."),
  name: z.string().trim().min(2).max(80, "Name is required."),
  note: z.string().trim().max(500).optional(),
  phone: bdPhoneSchema,
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const getOrderSchema = z.object({
  orderCode: orderCodeSchema,
});

export const listAdminOrdersSchema = z.object({
  page: z.number().int().min(1).default(1),
  status: orderStatusSchema.optional(),
});

export const updateOrderStatusSchema = z.object({
  orderCode: orderCodeSchema,
  status: orderStatusSchema,
});

export const createUpdateReviewSchema = z.object({
  comment: z.string().trim().max(2000).optional(),
  productId: idSchema,
  rating: z.number().int().min(1).max(5),
});

export const deleteReviewSchema = z.object({
  reviewId: idSchema,
});

/** Product-scoped query, used by the review list and "my review" lookups. */
export const productIdSchema = z.object({
  productId: idSchema,
});

/** Number of reviews rendered per page on the product detail page. */
export const REVIEWS_PAGE_SIZE = 6;

export const listReviewsSchema = z.object({
  page: z.number().int().min(1).default(1),
  productId: idSchema,
});

export const mergeGuestCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: idSchema,
        quantity: z.number().int().min(1).max(99),
      })
    )
    .max(50),
});

/** Rows per page in the admin tables. */
export const ADMIN_PAGE_SIZE = 12;

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and dashes."
  );

const imageUrlSchema = z.string().trim().url().max(500);

export const adminListProductsSchema = z.object({
  page: z.number().int().min(1).default(1),
  q: z.string().trim().max(100).optional(),
});

export const productWriteSchema = z.object({
  attributes: z.record(z.string(), z.string().max(120)).default({}),
  categoryId: z.string().uuid(),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  description: z.string().trim().min(10).max(5000),
  featured: z.boolean().default(false),
  images: z.array(imageUrlSchema).min(1).max(8),
  name: z.string().trim().min(2).max(120),
  price: z.number().int().min(0),
  sku: z.string().trim().min(2).max(64).optional(),
  slug: slugSchema.optional(),
  stock: z.number().int().min(0).default(0),
});
export type ProductWriteInput = z.infer<typeof productWriteSchema>;

export const categoryWriteSchema = z.object({
  description: z.string().trim().max(500).optional(),
  image: imageUrlSchema.optional(),
  name: z.string().trim().min(2).max(80),
  slug: slugSchema.optional(),
  sortOrder: z.number().int().min(0).default(0),
});
export type CategoryWriteInput = z.infer<typeof categoryWriteSchema>;

export const productUpdateSchema = z.object({
  attributes: z.record(z.string(), z.string().max(120)).optional(),
  categoryId: z.string().uuid().optional(),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  featured: z.boolean().optional(),
  images: z.array(imageUrlSchema).min(1).max(8).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  price: z.number().int().min(0).optional(),
  productId: z.string().uuid(),
  sku: z.string().trim().min(2).max(64).optional(),
  slug: slugSchema.optional(),
  stock: z.number().int().min(0).optional(),
});

export const categoryUpdateSchema = z.object({
  categoryId: z.string().uuid(),
  description: z.string().trim().max(500).optional(),
  image: imageUrlSchema.optional(),
  name: z.string().trim().min(2).max(80).optional(),
  slug: slugSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const categoryIdSchema = z.object({ categoryId: z.string().uuid() });

export const adminListReviewsSchema = z.object({
  page: z.number().int().min(1).default(1),
});
