import { useGuestCart } from "@/lib/cart-store";
import { client, queryClient } from "@/utils/orpc";

/**
 * Fold the localStorage guest cart into the signed-in customer's server cart.
 * Safe to call when there is nothing to merge. The server applies the agreed
 * rule: the larger quantity wins, clamped to available stock.
 */
export async function mergeGuestCartIntoServer(): Promise<void> {
  const items = useGuestCart.getState().lines;
  if (items.length === 0) {
    return;
  }

  await client.cart.mergeGuestCart({ items });
  useGuestCart.getState().clear();
  await queryClient.invalidateQueries();
}
