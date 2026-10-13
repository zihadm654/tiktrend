"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

export function useWishlist() {
  const sessionQuery = authClient.useSession();
  const isSignedIn = sessionQuery.data !== null && !sessionQuery.isPending;

  const idsQuery = useQuery(
    orpc.wishlist.getWishlistIds.queryOptions({
      enabled: isSignedIn,
    })
  );

  const toggleMutation = useMutation(
    orpc.wishlist.toggle.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  const has = (productId: string) =>
    idsQuery.data?.includes(productId) ?? false;

  return {
    has,
    ids: idsQuery.data ?? [],
    isPending: sessionQuery.isPending || (isSignedIn && idsQuery.isPending),
    isSignedIn,
    toggle: (productId: string) => toggleMutation.mutate({ productId }),
  };
}
