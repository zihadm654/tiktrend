import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT } from "@/lib/money";
import { client } from "@/utils/orpc";

interface AdminOrderPageProps {
  params: Promise<{ orderCode: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderPageProps) {
  const { orderCode } = await params;

  const order = await client.admin
    .getOrder({ orderCode })
    .catch(() => notFound());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            aria-label="Back to orders"
            render={<Link href="/admin/orders" />}
            size="icon-sm"
            variant="ghost"
          >
            <ArrowLeftIcon />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-lg tracking-tight">
                {order.orderCode}
              </h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-muted-foreground text-xs">
              Placed {dateFormatter.format(new Date(order.placedAt))}
            </p>
          </div>
        </div>
        <OrderStatusControls
          orderCode={order.orderCode}
          status={order.status}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4 rounded-2xl border p-4">
          <h3 className="font-semibold text-sm">Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatBDT(item.unitPrice)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBDT(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator />

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatBDT(order.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{formatBDT(order.shippingFee)}</dd>
            </div>
            <div className="flex items-center justify-between font-semibold text-base">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatBDT(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-2xl border p-4">
            <h3 className="font-semibold text-sm">Customer</h3>
            <p className="text-sm">{order.customerName}</p>
            <p className="text-muted-foreground text-xs">
              {order.customerPhone}
            </p>
            {order.customerEmail ? (
              <p className="text-muted-foreground text-xs">
                {order.customerEmail}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border p-4">
            <h3 className="font-semibold text-sm">Delivery</h3>
            <p className="text-sm">{order.address}</p>
            <p className="text-muted-foreground text-xs">{order.city}</p>
            {order.note ? (
              <p className="mt-2 text-muted-foreground text-xs">
                <span className="font-medium text-foreground">Note:</span>{" "}
                {order.note}
              </p>
            ) : null}
          </div>

          {order.cancelledAt ? (
            <div className="rounded-2xl border border-destructive/30 p-4 text-destructive text-xs">
              Cancelled {dateFormatter.format(new Date(order.cancelledAt))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
