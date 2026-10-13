import type { OrderStatus } from "@tiktrend/api/lib/schemas";
import type { Route } from "next";
import Link from "next/link";

import { AdminPager } from "@/components/admin/admin-pager";
import { OrderStatusFilter } from "@/components/admin/order-status-filter";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
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

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const statusParam = first(params.status);
  const status = STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const rawPage = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const { items, pageMeta } = await client.admin.listOrders({ page, status });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg tracking-tight">Orders</h2>
          <p className="text-muted-foreground text-sm">
            {pageMeta.total} total
          </p>
        </div>
        <OrderStatusFilter value={status ?? "all"} />
      </div>

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No orders found</EmptyTitle>
            <EmptyDescription>
              {status
                ? `No ${status} orders right now.`
                : "Orders will appear here as they come in."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.orderCode}>
                  <TableCell className="font-medium">
                    {item.orderCode}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{item.customerName}</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {item.customerPhone} · {item.city}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(new Date(item.placedAt))}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {item.itemCount}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatBDT(item.total)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      render={
                        <Link
                          href={`/admin/orders/${item.orderCode}` as Route}
                        />
                      }
                      size="sm"
                      variant="outline"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminPager
        basePath="/admin/orders"
        page={pageMeta.page}
        query={{ status }}
        totalPages={pageMeta.totalPages}
      />
    </div>
  );
}
