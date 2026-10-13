"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { loginHref } from "@/lib/catalog-params";
import { formatBDT } from "@/lib/money";
import { orpc } from "@/utils/orpc";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function OrdersPage() {
  const router = useRouter();
  const sessionQuery = authClient.useSession();
  const isSignedIn = sessionQuery.data !== null && !sessionQuery.isPending;

  const ordersQuery = useQuery(
    orpc.orders.listMyOrders.queryOptions({
      enabled: isSignedIn,
    })
  );

  if (sessionQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>Sign in to see your orders</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            Every order you place is saved to your account with its delivery
            status.
          </EmptyDescription>
          <Button onClick={() => router.push(loginHref("/orders"))}>
            Sign in
          </Button>
        </Empty>
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];

  let list: ReactNode;
  if (ordersQuery.status === "pending") {
    list = (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  } else if (orders.length === 0) {
    list = (
      <Empty className="min-h-64 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageIcon />
          </EmptyMedia>
          <EmptyTitle>No orders yet</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription>
          When you place an order it will show up here.
        </EmptyDescription>
        <Button render={<Link href="/watches" />}>Browse watches</Button>
      </Empty>
    );
  } else {
    list = (
      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.orderCode}>
            <Link
              className="flex items-center justify-between gap-4 rounded-2xl border p-4 outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring/50"
              href={`/orders/${order.orderCode}`}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-medium text-foreground">
                  {order.orderCode}
                </span>
                <span className="text-muted-foreground text-xs">
                  {dateFormatter.format(new Date(order.placedAt))} ·{" "}
                  {order.itemCount} item
                  {order.itemCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="font-semibold text-sm tabular-nums">
                  {formatBDT(order.total)}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-3xl tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground text-sm">
          Track delivery and review past purchases.
        </p>
      </header>

      {list}
    </div>
  );
}
