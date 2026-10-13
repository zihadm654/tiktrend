"use client";

import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { useCart } from "@/hooks/use-cart";
import { formatBDT } from "@/lib/money";

const FALLBACK_IMAGE = "https://picsum.photos/seed/watch-placeholder/800/800";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const cart = useCart();

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={
          <Button
            aria-label={`Open cart, ${cart.count} item${cart.count === 1 ? "" : "s"}`}
            className="relative"
            size="icon-sm"
            variant="ghost"
          >
            <ShoppingBagIcon data-icon />
          </Button>
        }
      >
        {cart.count > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-semibold text-[0.625rem] text-primary-foreground tabular-nums">
            {cart.count > 99 ? "99" : cart.count}
          </span>
        ) : null}
      </SheetTrigger>

      <SheetContent className="w-full gap-0 p-0 sm:max-w-md" side="right">
        <SheetTitle className="sr-only">Your cart</SheetTitle>
        <SheetDescription className="sr-only">
          Review the watches in your cart.
        </SheetDescription>

        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="font-semibold text-base tracking-tight">Your Cart</h2>
          {cart.count > 0 ? (
            <span className="text-muted-foreground text-xs tabular-nums">
              {cart.count} item{cart.count === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBagIcon />
                </EmptyMedia>
                <EmptyTitle>Your cart is empty</EmptyTitle>
              </EmptyHeader>
            </Empty>
            <Button
              render={<Link href="/watches" onClick={() => setOpen(false)} />}
              variant="outline"
            >
              Browse watches
            </Button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <ul className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
              {cart.lines.map((line) => (
                <li className="flex gap-3" key={line.productId}>
                  <Link
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                    href={`/watches/${line.slug}`}
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      alt={line.name}
                      className="object-cover"
                      fill
                      sizes="64px"
                      src={line.images[0] ?? FALLBACK_IMAGE}
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        className="line-clamp-2 font-medium text-foreground text-sm hover:underline"
                        href={`/watches/${line.slug}`}
                        onClick={() => setOpen(false)}
                      >
                        {line.name}
                      </Link>
                      <Button
                        aria-label={`Remove ${line.name} from cart`}
                        onClick={() => cart.remove(line.productId)}
                        size="icon-xs"
                        variant="ghost"
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {formatBDT(line.price)} each
                    </span>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          aria-label="Decrease quantity"
                          disabled={line.quantity <= 1}
                          onClick={() =>
                            cart.updateQuantity(
                              line.productId,
                              Math.max(1, line.quantity - 1)
                            )
                          }
                          size="icon-xs"
                          variant="outline"
                        >
                          <MinusIcon />
                        </Button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <Button
                          aria-label="Increase quantity"
                          disabled={line.quantity >= line.stock}
                          onClick={() =>
                            cart.updateQuantity(
                              line.productId,
                              Math.min(line.stock, line.quantity + 1)
                            )
                          }
                          size="icon-xs"
                          variant="outline"
                        >
                          <PlusIcon />
                        </Button>
                      </div>
                      <span className="font-medium text-sm tabular-nums">
                        {formatBDT(line.lineTotal)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-1 border-t px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Subtotal</span>
                <span className="font-semibold text-base tabular-nums">
                  {formatBDT(cart.subtotal)}
                </span>
              </div>
              <Separator />
              <p className="text-muted-foreground text-xs">
                {siteConfig.shipping.note}
              </p>
            </div>

            <div className="px-6 pb-6">
              <Button
                className="w-full"
                render={
                  <Link href="/checkout" onClick={() => setOpen(false)} />
                }
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
