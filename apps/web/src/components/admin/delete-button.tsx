"use client";

import { useMutation } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
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

type DeleteKind = "category" | "product" | "review";

interface DeleteButtonProps {
  id: string;
  kind: DeleteKind;
  label?: string;
  name: string;
}

const NOUNS: Record<DeleteKind, string> = {
  category: "category",
  product: "product",
  review: "review",
};

export function DeleteButton({ kind, id, name, label }: DeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const deleteRecord = () => {
    switch (kind) {
      case "product":
        return client.admin.deleteProduct({ productId: id });
      case "category":
        return client.admin.deleteCategory({ categoryId: id });
      case "review":
        return client.admin.deleteReview({ reviewId: id });
      default:
        throw new Error(`Unsupported delete kind: ${kind}`);
    }
  };

  const mutation = useMutation({
    mutationFn: deleteRecord,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      toast.success(`Deleted ${NOUNS[kind]}.`);
      setOpen(false);
      await queryClient.invalidateQueries();
      router.refresh();
    },
  });

  const openDialog = () => {
    setOpen(true);
  };

  const confirmDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <Button
        aria-label={`Delete ${name}`}
        disabled={mutation.isPending}
        onClick={openDialog}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Trash2Icon />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {NOUNS[kind]}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes{" "}
            <span className="font-medium text-foreground">{name}</span>. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={confirmDelete}
            variant="destructive"
          >
            {mutation.isPending ? "Deleting…" : (label ?? "Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
