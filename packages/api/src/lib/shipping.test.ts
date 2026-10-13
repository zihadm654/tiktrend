import { describe, expect, it } from "vitest";

import {
  computeShippingFee,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from "./shipping";

describe("computeShippingFee", () => {
  it("charges the flat fee below the free threshold", () => {
    expect(computeShippingFee(0)).toBe(SHIPPING_FEE);
    expect(computeShippingFee(SHIPPING_FEE)).toBe(SHIPPING_FEE);
    expect(computeShippingFee(FREE_SHIPPING_THRESHOLD - 1)).toBe(SHIPPING_FEE);
  });

  it("is free at or above the threshold", () => {
    expect(computeShippingFee(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(computeShippingFee(FREE_SHIPPING_THRESHOLD + 1)).toBe(0);
  });
});
