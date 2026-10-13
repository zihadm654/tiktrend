/**
 * Pure cart arithmetic, kept free of database access so it can be unit tested.
 * Quantities are whole units and never exceed available stock.
 */

export interface CartMergeLine {
  productId: string;
  quantity: number;
}

/**
 * Merge the signed-in server cart with a guest (localStorage) cart.
 * The larger quantity wins and the result is clamped to available stock.
 * Lines whose product is missing or out of stock are dropped.
 */
export function mergeCartLines(
  serverLines: CartMergeLine[],
  guestLines: CartMergeLine[],
  stockByProduct: ReadonlyMap<string, number>
): Map<string, number> {
  const merged = new Map(
    serverLines.map((line) => [line.productId, line.quantity])
  );

  for (const line of guestLines) {
    const stock = stockByProduct.get(line.productId);
    if (stock === undefined || stock <= 0) {
      continue;
    }
    const current = merged.get(line.productId) ?? 0;
    const desired = Math.min(Math.max(current, line.quantity), stock);
    if (desired > 0) {
      merged.set(line.productId, desired);
    }
  }

  return merged;
}

/**
 * Quantity to store when adding to a cart. Clamped to `stock`; returns 0 when
 * the product cannot be added at all.
 */
export function resolveAddQuantity(
  existingQuantity: number,
  requestedQuantity: number,
  stock: number
): number {
  if (stock <= 0) {
    return 0;
  }
  return Math.min(existingQuantity + requestedQuantity, stock);
}
