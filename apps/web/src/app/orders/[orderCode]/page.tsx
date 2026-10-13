import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderCancelButton } from "@/components/order/order-cancel-button";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { Separator } from "@/components/ui/separator";
import { formatBDT } from "@/lib/money";
import { client } from "@/utils/orpc";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

interface OrderPageProps {
  params: Promise<{ orderCode: string }>;
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { orderCode } = await params;
  return { title: `Order ${orderCode} · TikTrend` };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { orderCode } = await params;

  let order: Awaited<ReturnType<typeof client.orders.getOrder>>;
  try {
    order = await client.orders.getOrder({ orderCode });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Link
          className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
          href="/orders"
        >
          ← All orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-2xl tracking-tight">
              {order.orderCode}
            </h1>
            <p className="text-muted-foreground text-sm">
              Placed {dateFormatter.format(new Date(order.placedAt))}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border p-6">
        <h2 className="font-semibold text-sm tracking-tight">Items</h2>
        <ul className="flex flex-col gap-4">
          {order.items.map((item) => (
            <li
              className="flex items-start justify-between gap-4"
              key={item.id}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="line-clamp-1 font-medium text-foreground">
                  {item.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatBDT(item.unitPrice)} × {item.quantity}
                </span>
              </div>
              <span className="shrink-0 font-medium text-sm tabular-nums">
                {formatBDT(item.total)}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatBDT(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="tabular-nums">
              {order.shippingFee === 0 ? "Free" : formatBDT(order.shippingFee)}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between font-semibold text-base">
          <span>Total</span>
          <span className="tabular-nums">{formatBDT(order.total)}</span>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border p-6">
        <h2 className="font-semibold text-sm tracking-tight">Delivery</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted-foreground">Name</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted-foreground">Phone</dt>
            <dd>{order.customerPhone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted-foreground">Address</dt>
            <dd>
              {order.address}, {order.city}
            </dd>
          </div>
          {order.note ? (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-muted-foreground">Note</dt>
              <dd>{order.note}</dd>
            </div>
          ) : null}
        </dl>
        <p className="text-muted-foreground text-xs">
          Payment method: Cash on Delivery.
        </p>
      </section>

      {order.status === "pending" ? (
        <div className="flex justify-end">
          <OrderCancelButton orderCode={order.orderCode} />
        </div>
      ) : null}
    </div>
  );
}
