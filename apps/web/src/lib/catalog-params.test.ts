import { describe, expect, it } from "vitest";

import {
  catalogHref,
  catalogToQuery,
  loginHref,
  parseCatalogFilters,
} from "./catalog-params";

describe("parseCatalogFilters", () => {
  it("defaults to the newest sort on page 1", () => {
    const filters = parseCatalogFilters({});
    expect(filters.sort).toBe("newest");
    expect(filters.page).toBe(1);
    expect(filters.category).toBeUndefined();
    expect(filters.q).toBeUndefined();
  });

  it("parses and trims provided values", () => {
    const filters = parseCatalogFilters({
      category: "dive",
      maxPrice: "500",
      minPrice: "100",
      page: "3",
      q: "  sea  ",
      sort: "priceAsc",
    });
    expect(filters).toMatchObject({
      category: "dive",
      maxPrice: 500,
      minPrice: 100,
      page: 3,
      q: "sea",
      sort: "priceAsc",
    });
  });

  it("falls back to defaults for invalid sort and page", () => {
    expect(parseCatalogFilters({ sort: "bogus" }).sort).toBe("newest");
    expect(parseCatalogFilters({ page: "0" }).page).toBe(1);
    expect(parseCatalogFilters({ page: "-2" }).page).toBe(1);
    expect(parseCatalogFilters({ page: "abc" }).page).toBe(1);
  });

  it("takes the first value when a param repeats", () => {
    expect(parseCatalogFilters({ q: ["a", "b"] }).q).toBe("a");
  });
});

describe("catalogToQuery", () => {
  it("omits default values", () => {
    expect(catalogToQuery({ page: 1, sort: "newest" })).toBe("");
  });

  it("serializes non-default values", () => {
    expect(catalogToQuery({ page: 2, q: "diver", sort: "priceAsc" })).toBe(
      "?q=diver&sort=priceAsc&page=2"
    );
  });
});

describe("catalogHref", () => {
  it("prefixes /watches", () => {
    expect(catalogHref({ page: 1, sort: "newest" })).toBe("/watches");
    expect(catalogHref({ page: 1, sort: "rating" })).toBe(
      "/watches?sort=rating"
    );
  });
});

describe("loginHref", () => {
  it("omits a next target when none is given", () => {
    expect(loginHref()).toBe("/login");
  });

  it("encodes the redirect target", () => {
    expect(loginHref("/checkout")).toBe("/login?next=%2Fcheckout");
  });
});
