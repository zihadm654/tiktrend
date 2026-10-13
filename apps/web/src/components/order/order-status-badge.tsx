import type { OrderStatus } from "@tiktrend/api/lib/schemas";

import { Badge } from "@/components/ui/badge";

const LABELS: Record<OrderStatus, string> = {
  cancelled: "Cancelled",
  confirmed: "Confirmed",
  delivered: "Delivered",
  pending: "Pending",
  shipped: "Shipped",
};

const VARIANTS: Record<OrderStatus, "default" | "destructive" | "secondary"> = {
  cancelled: "destructive",
  confirmed: "secondary",
  delivered: "default",
  pending: "secondary",
  shipped: "secondary",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
