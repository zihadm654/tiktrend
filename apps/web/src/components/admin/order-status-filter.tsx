"use client";

import type { OrderStatus } from "@tiktrend/api/lib/schemas";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS: ReadonlyArray<{ value: OrderStatus | "all"; label: string }> = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export function OrderStatusFilter({ value }: { value: OrderStatus | "all" }) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(next) => {
        const params = new URLSearchParams();
        if (next !== "all") {
          params.set("status", next as string);
        }
        const qs = params.toString();
        router.push((qs ? `/admin/orders?${qs}` : "/admin/orders") as Route);
      }}
      value={value}
    >
      <SelectTrigger aria-label="Filter by status" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
