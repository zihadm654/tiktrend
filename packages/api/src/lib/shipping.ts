/**
 * Shipping rules for the store. All money is integer minor units (poisha).
 * Both the API (order totals) and web (display) read these so they never drift.
 */

/** Flat delivery fee: ৳60. */
export const SHIPPING_FEE = 6000;

/** Orders at or above this subtotal ship free: ৳1,000. */
export const FREE_SHIPPING_THRESHOLD = 100_000;

export function computeShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
