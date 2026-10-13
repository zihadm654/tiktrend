"use client";

import { useMutation } from "@tanstack/react-query";
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
import { orpc, queryClient } from "@/utils/orpc";

export function OrderCancelButton({ orderCode }: { orderCode: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const cancelOrder = useMutation(
    orpc.orders.cancelOrder.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        toast.success(`Order ${orderCode} cancelled`);
        await queryClient.invalidateQueries();
        setOpen(false);
        router.refresh();
      },
    })
  );

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)} variant="outline">
        Cancel order
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order {orderCode}?</AlertDialogTitle>
          <AlertDialogDescription>
            This releases your reserved stock. You cannot undo this from your
            account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelOrder.isPending}>
            Keep order
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={cancelOrder.isPending}
            onClick={(event) => {
              event.preventDefault();
              cancelOrder.mutate({ orderCode });
            }}
            variant="destructive"
          >
            {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
