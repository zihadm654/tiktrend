import { beforeEach, describe, expect, it } from "vitest";
import { createJSONStorage } from "zustand/middleware";

import { useGuestCart } from "./cart-store";

// Back the persisted store with in-memory storage so the test does not depend
// on a real localStorage (Node exposes an inert global that shadows jsdom's).
function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

const memoryStorage = createMemoryStorage();

useGuestCart.persist.setOptions({
  storage: createJSONStorage(() => memoryStorage),
});

beforeEach(() => {
  memoryStorage.clear();
  useGuestCart.setState({ lines: [] });
});

describe("guest cart", () => {
  it("adds a line and accumulates repeat adds", () => {
    useGuestCart.getState().add("a", 2);
    useGuestCart.getState().add("a", 3);

    expect(useGuestCart.getState().lines).toEqual([
      { productId: "a", quantity: 5 },
    ]);
  });

  it("keeps separate lines for separate products", () => {
    useGuestCart.getState().add("a", 1);
    useGuestCart.getState().add("b", 2);

    expect(useGuestCart.getState().lines).toEqual([
      { productId: "a", quantity: 1 },
      { productId: "b", quantity: 2 },
    ]);
  });

  it("caps a single line at 99", () => {
    useGuestCart.getState().add("a", 90);
    useGuestCart.getState().add("a", 50);

    expect(useGuestCart.getState().lines[0]?.quantity).toBe(99);
  });

  it("sets, removes, and clears lines", () => {
    useGuestCart.getState().add("a", 1);
    useGuestCart.getState().add("b", 1);

    useGuestCart.getState().setQuantity("a", 7);
    expect(
      useGuestCart.getState().lines.find((line) => line.productId === "a")
        ?.quantity
    ).toBe(7);

    useGuestCart.getState().remove("a");
    expect(useGuestCart.getState().lines).toEqual([
      { productId: "b", quantity: 1 },
    ]);

    useGuestCart.getState().clear();
    expect(useGuestCart.getState().lines).toEqual([]);
  });
});
