import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GuestCartLine {
  productId: string;
  quantity: number;
}

interface GuestCartState {
  add: (productId: string, quantity: number) => void;
  clear: () => void;
  lines: GuestCartLine[];
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
}

/**
 * The pre-sign-in cart lives in localStorage. When a customer signs in it is
 * merged into their server cart (max quantity wins, clamped to stock).
 */
export const useGuestCart = create<GuestCartState>()(
  persist(
    (set, get) => ({
      add: (productId, quantity) => {
        const existing = get().lines.find(
          (line) => line.productId === productId
        );
        set({
          lines: existing
            ? get().lines.map((line) =>
                line.productId === productId
                  ? {
                      ...line,
                      quantity: Math.min(99, line.quantity + quantity),
                    }
                  : line
              )
            : [...get().lines, { productId, quantity }],
        });
      },
      clear: () => {
        set({ lines: [] });
      },
      lines: [],
      remove: (productId) => {
        set({
          lines: get().lines.filter((line) => line.productId !== productId),
        });
      },
      setQuantity: (productId, quantity) => {
        set({
          lines: get().lines.map((line) =>
            line.productId === productId ? { ...line, quantity } : line
          ),
        });
      },
    }),
    {
      name: "tiktrend-guest-cart",
      // Keep SSR free of localStorage access; hydration happens on the client.
      skipHydration: false,
      version: 1,
    }
  )
);
