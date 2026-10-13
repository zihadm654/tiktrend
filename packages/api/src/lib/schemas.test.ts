import { describe, expect, it } from "vitest";

import {
  bdPhoneSchema,
  catalogSortSchema,
  categoryWriteSchema,
  checkoutSchema,
  createUpdateReviewSchema,
  orderCodeSchema,
  productWriteSchema,
} from "./schemas";

const UUID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("bdPhoneSchema", () => {
  it.each(["01712345678", "+8801712345678", "8801712345678", " 01712345678 "])(
    "accepts %s",
    (value) => {
      expect(bdPhoneSchema.safeParse(value).success).toBe(true);
    }
  );

  it.each([
    "123",
    "017123456",
    "02712345678",
    "+880271234567",
    "017123456789",
    "abc",
    "",
  ])("rejects %s", (value) => {
    expect(bdPhoneSchema.safeParse(value).success).toBe(false);
  });
});

describe("catalogSortSchema", () => {
  it.each(["newest", "priceAsc", "priceDesc", "rating", "popular"])(
    "accepts %s",
    (value) => {
      expect(catalogSortSchema.safeParse(value).success).toBe(true);
    }
  );

  it("rejects an unknown sort", () => {
    expect(catalogSortSchema.safeParse("cheapest").success).toBe(false);
  });
});

describe("orderCodeSchema", () => {
  it("accepts a well-formed code", () => {
    expect(orderCodeSchema.safeParse("TT-7F3K2Q").success).toBe(true);
  });

  it.each(["AB-7F3K2Q", "TT-7f3k2q", "TT-7F3K2", "TT-7F3K2QQ"])(
    "rejects %s",
    (value) => {
      expect(orderCodeSchema.safeParse(value).success).toBe(false);
    }
  );
});

describe("checkoutSchema", () => {
  const valid = {
    address: "House 12, Road 5, Banani",
    city: "Dhaka",
    name: "Rahim Uddin",
    phone: "01712345678",
  };

  it("accepts a valid checkout payload", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a too-short address", () => {
    expect(
      checkoutSchema.safeParse({ ...valid, address: "Rd 5" }).success
    ).toBe(false);
  });

  it("rejects an invalid phone", () => {
    expect(checkoutSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(
      false
    );
  });
});

describe("productWriteSchema", () => {
  const valid = {
    categoryId: UUID,
    description: "A reliable automatic dive watch with 200m water resistance.",
    images: ["https://picsum.photos/seed/diver/800/800"],
    name: "Dive Master",
    price: 1_500_000,
  };

  it("applies defaults for optional fields", () => {
    const parsed = productWriteSchema.parse(valid);
    expect(parsed.attributes).toEqual({});
    expect(parsed.featured).toBe(false);
    expect(parsed.stock).toBe(0);
  });

  it("requires at least one image", () => {
    expect(productWriteSchema.safeParse({ ...valid, images: [] }).success).toBe(
      false
    );
  });

  it("rejects a negative price", () => {
    expect(productWriteSchema.safeParse({ ...valid, price: -1 }).success).toBe(
      false
    );
  });

  it("rejects a non-uuid category", () => {
    expect(
      productWriteSchema.safeParse({ ...valid, categoryId: "dive" }).success
    ).toBe(false);
  });
});

describe("categoryWriteSchema", () => {
  it("defaults sortOrder to 0", () => {
    const parsed = categoryWriteSchema.parse({ name: "Dive" });
    expect(parsed.sortOrder).toBe(0);
  });

  it("rejects a name that is too short", () => {
    expect(categoryWriteSchema.safeParse({ name: "D" }).success).toBe(false);
  });
});

describe("createUpdateReviewSchema", () => {
  it("accepts a rating without a comment", () => {
    expect(
      createUpdateReviewSchema.safeParse({ productId: UUID, rating: 5 }).success
    ).toBe(true);
  });

  it.each([0, 6, 2.5])("rejects rating %s", (rating) => {
    expect(
      createUpdateReviewSchema.safeParse({ productId: UUID, rating }).success
    ).toBe(false);
  });
});
