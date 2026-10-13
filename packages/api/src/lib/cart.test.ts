import { describe, expect, it } from "vitest";

import { mergeCartLines, resolveAddQuantity } from "./cart";

describe("resolveAddQuantity", () => {
  it("accumulates existing and requested quantity", () => {
    expect(resolveAddQuantity(1, 1, 10)).toBe(2);
    expect(resolveAddQuantity(0, 5, 10)).toBe(5);
  });

  it("clamps the result to available stock", () => {
    expect(resolveAddQuantity(0, 5, 3)).toBe(3);
    expect(resolveAddQuantity(2, 5, 3)).toBe(3);
  });

  it("returns 0 when the product is out of stock", () => {
    expect(resolveAddQuantity(0, 1, 0)).toBe(0);
    expect(resolveAddQuantity(2, 1, -1)).toBe(0);
  });
});

describe("mergeCartLines", () => {
  const stock = new Map<string, number>([
    ["a", 5],
    ["b", 2],
    ["c", 0],
  ]);

  it("keeps the larger quantity when merging", () => {
    const merged = mergeCartLines(
      [{ productId: "a", quantity: 2 }],
      [{ productId: "a", quantity: 4 }],
      stock
    );
    expect(merged.get("a")).toBe(4);
  });

  it("keeps the server quantity when it is larger", () => {
    const merged = mergeCartLines(
      [{ productId: "a", quantity: 5 }],
      [{ productId: "a", quantity: 1 }],
      stock
    );
    expect(merged.get("a")).toBe(5);
  });

  it("clamps the merged quantity to stock", () => {
    const merged = mergeCartLines(
      [{ productId: "b", quantity: 5 }],
      [{ productId: "b", quantity: 1 }],
      stock
    );
    expect(merged.get("b")).toBe(2);
  });

  it("adds guest-only lines", () => {
    const merged = mergeCartLines([], [{ productId: "b", quantity: 1 }], stock);
    expect(merged.get("b")).toBe(1);
  });

  it("drops out-of-stock and unknown products", () => {
    const merged = mergeCartLines(
      [],
      [
        { productId: "c", quantity: 2 },
        { productId: "zzz", quantity: 1 },
      ],
      stock
    );
    expect(merged.has("c")).toBe(false);
    expect(merged.has("zzz")).toBe(false);
    expect(merged.size).toBe(0);
  });
});
