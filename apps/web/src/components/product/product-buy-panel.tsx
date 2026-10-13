"use client";

import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

import { Price } from "./price";
import { WishlistButton } from "./wishlist-button";

interface ProductBuyPanelProps {
  compareAtPrice: number | null;
  inStock: boolean;
  name: string;
  price: number;
  productId: string;
  stock: number;
}

export function ProductBuyPanel({
  productId,
  name,
  price,
  compareAtPrice,
  stock,
  inStock,
}: ProductBuyPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();

  const handleAdd = () => {
    cart.add(productId, quantity);
    toast.success(`${name} added to your cart`);
  };

  const decrement = () => {
    setQuantity((value) => Math.max(1, value - 1));
  };

  const increment = () => {
    setQuantity((value) => Math.min(stock, value + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <Price
        className="text-2xl"
        compareAtPrice={compareAtPrice}
        price={price}
      />

      <p
        className={cn(
          "text-sm",
          inStock ? "text-foreground" : "text-destructive"
        )}
      >
        {inStock ? (
          <>
            In stock
            {stock > 0 ? (
              <span className="text-muted-foreground">
                {" "}
                · {stock} available
              </span>
            ) : null}
          </>
        ) : (
          "Out of stock"
        )}
      </p>

      <div className="flex items-stretch gap-3">
        <div className="flex items-center gap-1 rounded-md border transition-colors focus-within:border-ring">
          <Button
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={decrement}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <MinusIcon />
          </Button>
          <span
            aria-live="polite"
            className="w-8 text-center text-sm tabular-nums"
          >
            {quantity}
          </span>
          <Button
            aria-label="Increase quantity"
            disabled={!inStock || quantity >= stock}
            onClick={increment}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <PlusIcon />
          </Button>
        </div>

        <Button className="flex-1" disabled={!inStock} onClick={handleAdd}>
          <ShoppingCartIcon data-icon />
          {inStock ? "Add to cart" : "Out of stock"}
        </Button>

        <WishlistButton productId={productId} />
      </div>

      <p className="text-muted-foreground text-xs">
        Cash on Delivery is available for this item.
      </p>
    </div>
  );
}
