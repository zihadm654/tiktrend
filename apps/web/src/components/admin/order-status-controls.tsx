"use client";

import { useMutation } from "@tanstack/react-query";
import type { OrderStatus } from "@tiktrend/api/lib/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { client, queryClient } from "@/utils/orpc";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  cancelled: [],
  confirmed: ["shipped", "cancelled"],
  delivered: [],
  pending: ["confirmed", "cancelled"],
  shipped: ["delivered", "cancelled"],
};

const LABELS: Record<OrderStatus, string> = {
  cancelled: "Cancelled",
  confirmed: "Confirmed",
  delivered: "Delivered",
  pending: "Pending",
  shipped: "Shipped",
};

export function OrderStatusControls({
  orderCode,
  status,
}: {
  orderCode: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (next: OrderStatus) =>
      client.admin.updateOrderStatus({ orderCode, status: next }),
    onError: (error) => toast.error(error.message),
    onSuccess: async (_data, next) => {
      toast.success(`Order ${orderCode} marked ${LABELS[next].toLowerCase()}.`);
      setCancelOpen(false);
      await queryClient.invalidateQueries();
      router.refresh();
    },
  });

  const forward = TRANSITIONS[status].filter((next) => next !== "cancelled");
  const canCancel = TRANSITIONS[status].includes("cancelled");

  if (forward.length === 0 && !canCancel) {
    return (
      <p className="text-muted-foreground text-xs">
        No further actions available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {forward.map((next) => (
        <Button
          disabled={mutation.isPending}
          key={next}
          onClick={() => mutation.mutate(next)}
          size="sm"
        >
          Mark as {LABELS[next].toLowerCase()}
        </Button>
      ))}

      {canCancel ? (
        <AlertDialog onOpenChange={setCancelOpen} open={cancelOpen}>
          <Button
            disabled={mutation.isPending}
            onClick={() => setCancelOpen(true)}
            size="sm"
            variant="outline"
          >
            Cancel order
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel order {orderCode}?</AlertDialogTitle>
              <AlertDialogDescription>
                This restores the reserved stock for every item in the order.
                The customer will see it as cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={mutation.isPending}>
                Keep order
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={mutation.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  mutation.mutate("cancelled");
                }}
                variant="destructive"
              >
                {mutation.isPending ? "Cancelling…" : "Cancel order"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
