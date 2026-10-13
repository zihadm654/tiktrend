"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { authClient } from "@/lib/auth-client";
import { useGuestCart } from "@/lib/cart-store";
import { orpc, queryClient } from "@/utils/orpc";

export interface CartLineView {
  compareAtPrice: number | null;
  images: string[];
  lineTotal: number;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  slug: string;
  stock: number;
}

export interface CartView {
  add: (productId: string, quantity?: number) => void;
  clear: () => void;
  count: number;
  isPending: boolean;
  lines: CartLineView[];
  remove: (productId: string) => void;
  subtotal: number;
  updateQuantity: (productId: string, quantity: number) => void;
}

export function useCart(): CartView {
  const sessionQuery = authClient.useSession();
  const isSignedIn = sessionQuery.data !== null && !sessionQuery.isPending;
  const isSessionReady = !sessionQuery.isPending;

  const guestCart = useGuestCart();
  const guestIds = guestCart.lines.map((line) => line.productId);

  const serverCartQuery = useQuery(
    orpc.cart.getCart.queryOptions({
      enabled: isSignedIn,
    })
  );

  const guestProductsQuery = useQuery(
    orpc.catalog.getProductsByIds.queryOptions({
      enabled: !isSignedIn && guestIds.length > 0,
      input: { ids: guestIds },
    })
  );

  const addItemMutation = useMutation(
    orpc.cart.addItem.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );
  const updateItemMutation = useMutation(
    orpc.cart.updateItem.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );
  const removeItemMutation = useMutation(
    orpc.cart.removeItem.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );
  const clearCartMutation = useMutation(
    orpc.cart.clearCart.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  const add = useCallback(
    (productId: string, quantity = 1) => {
      if (isSignedIn) {
        addItemMutation.mutate({ productId, quantity });
      } else {
        guestCart.add(productId, quantity);
      }
    },
    [isSignedIn, addItemMutation.mutate, guestCart.add] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (isSignedIn) {
        updateItemMutation.mutate({ productId, quantity });
      } else {
        guestCart.setQuantity(productId, quantity);
      }
    },
    [isSignedIn, updateItemMutation.mutate, guestCart.setQuantity] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const remove = useCallback(
    (productId: string) => {
      if (isSignedIn) {
        removeItemMutation.mutate({ productId });
      } else {
        guestCart.remove(productId);
      }
    },
    [isSignedIn, removeItemMutation.mutate, guestCart.remove] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const clear = useCallback(() => {
    if (isSignedIn) {
      clearCartMutation.mutate();
    } else {
      guestCart.clear();
    }
  }, [isSignedIn, clearCartMutation.mutate, guestCart.clear]); // eslint-disable-line react-hooks/exhaustive-deps

  const lines = useMemo<CartLineView[]>(() => {
    if (isSignedIn) {
      return serverCartQuery.data?.items ?? [];
    }

    const byId = new Map(
      (guestProductsQuery.data ?? []).map((product) => [product.id, product])
    );
    return guestCart.lines.flatMap((line) => {
      const product = byId.get(line.productId);
      if (!product) {
        return [];
      }
      return [
        {
          compareAtPrice: product.compareAtPrice,
          images: product.images,
          lineTotal: product.price * line.quantity,
          name: product.name,
          price: product.price,
          productId: product.id,
          quantity: line.quantity,
          slug: product.slug,
          stock: product.stock,
        },
      ];
    });
  }, [
    isSignedIn,
    serverCartQuery.data,
    guestCart.lines,
    guestProductsQuery.data,
  ]);

  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const count = lines.reduce((total, line) => total + line.quantity, 0);

  return {
    add,
    clear,
    count,
    isPending: !isSessionReady,
    lines,
    remove,
    subtotal,
    updateQuantity,
  };
}
