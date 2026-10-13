import type { OrderStatus } from "@tiktrend/api/lib/schemas";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { client } from "@/utils/orpc";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export default async function AdminHome() {
  const stats = await client.admin.stats();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {ORDER_STATUSES.map((status) => (
          <Link
            className="flex flex-col gap-2 rounded-2xl border p-4 transition-colors hover:border-foreground/20"
            href={{ pathname: "/admin/orders", query: { status } }}
            key={status}
          >
            <OrderStatusBadge status={status} />
            <span className="font-semibold text-2xl tabular-nums">
              {stats[status]}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          className="rounded-2xl border p-4 font-medium text-sm transition-colors hover:border-foreground/20"
          href="/admin/products/new"
        >
          Add a product →
        </Link>
        <Link
          className="rounded-2xl border p-4 font-medium text-sm transition-colors hover:border-foreground/20"
          href="/admin/categories"
        >
          Manage categories →
        </Link>
        <Link
          className="rounded-2xl border p-4 font-medium text-sm transition-colors hover:border-foreground/20"
          href="/admin/orders"
        >
          Review orders →
        </Link>
      </div>
    </div>
  );
}
