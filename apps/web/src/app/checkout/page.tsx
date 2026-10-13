"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { checkoutSchema } from "@tiktrend/api/lib/schemas";
import { computeShippingFee } from "@tiktrend/api/lib/shipping";
import { ShoppingBagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { authClient } from "@/lib/auth-client";
import { mergeGuestCartIntoServer } from "@/lib/cart-merge";
import { useGuestCart } from "@/lib/cart-store";
import { loginHref } from "@/lib/catalog-params";
import { formatBDT } from "@/lib/money";
import { orpc, queryClient } from "@/utils/orpc";

function fieldErrors(errors: unknown[]): Array<{ message?: string }> {
  const result: Array<{ message?: string }> = [];
  for (const error of errors) {
    if (typeof error === "string") {
      result.push({ message: error });
    } else if (error && typeof error === "object" && "message" in error) {
      result.push({
        message: String((error as { message?: unknown }).message ?? ""),
      });
    }
  }
  return result;
}

function fieldChangeHandler(field: {
  handleChange: (value: string) => void;
}): (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
  return (event) => {
    field.handleChange(event.target.value);
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const sessionQuery = authClient.useSession();
  const isSignedIn = sessionQuery.data !== null && !sessionQuery.isPending;
  const isSessionReady = !sessionQuery.isPending;
  const cart = useCart();

  const placeOrder = useMutation(
    orpc.orders.placeOrder.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async (data) => {
        useGuestCart.getState().clear();
        await queryClient.invalidateQueries();
        toast.success(`Order ${data.orderCode} placed`);
        router.push(`/orders/${data.orderCode}` as Route);
      },
    })
  );

  // Fold any pre-sign-in cart into the account before checkout totals are read.
  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    mergeGuestCartIntoServer().catch(() => {
      // Ignore merge failures; the server cart is still authoritative.
    });
  }, [isSignedIn]);

  const form = useForm({
    defaultValues: {
      address: "",
      city: "",
      name: sessionQuery.data?.user.name ?? "",
      note: "",
      phone: "",
    },
    onSubmit: ({ value }) => {
      placeOrder.mutate(value);
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = checkoutSchema.safeParse(value);
        if (parsed.success) {
          return;
        }

        const fields: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const [key] = issue.path;
          if (typeof key === "string" && !(key in fields)) {
            fields[key] = issue.message;
          }
        }
        return { fields };
      },
    },
  });

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit();
  };

  if (!isSessionReady) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBagIcon />
            </EmptyMedia>
            <EmptyTitle>Sign in to check out</EmptyTitle>
          </EmptyHeader>
          <p className="text-muted-foreground text-sm">
            Orders are tied to your account so you can track and manage them.
          </p>
          <Button render={<Link href={loginHref("/checkout")} />}>
            Sign in to continue
          </Button>
        </Empty>
      </div>
    );
  }

  const { subtotal } = cart;
  const shippingFee = computeShippingFee(subtotal);
  const total = subtotal + shippingFee;

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBagIcon />
            </EmptyMedia>
            <EmptyTitle>Your cart is empty</EmptyTitle>
          </EmptyHeader>
          <Button render={<Link href="/watches" />}>Browse watches</Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-semibold text-3xl tracking-tight">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <form className="flex flex-col gap-6" onSubmit={handleFormSubmit}>
          <h2 className="font-semibold text-lg tracking-tight">
            Delivery details
          </h2>

          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const invalid = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      aria-invalid={invalid}
                      autoComplete="name"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={fieldChangeHandler(field)}
                      value={field.state.value}
                    />
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="phone">
              {(field) => {
                const invalid = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>Mobile number</FieldLabel>
                    <Input
                      aria-invalid={invalid}
                      autoComplete="tel"
                      id={field.name}
                      inputMode="tel"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={fieldChangeHandler(field)}
                      placeholder="01XXXXXXXXX"
                      type="tel"
                      value={field.state.value}
                    />
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="city">
              {(field) => {
                const invalid = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>City</FieldLabel>
                    <Input
                      aria-invalid={invalid}
                      autoComplete="address-level2"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={fieldChangeHandler(field)}
                      value={field.state.value}
                    />
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="address">
              {(field) => {
                const invalid = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>Street address</FieldLabel>
                    <Textarea
                      aria-invalid={invalid}
                      autoComplete="street-address"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={fieldChangeHandler(field)}
                      rows={3}
                      value={field.state.value}
                    />
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="note">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Order note (optional)
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={fieldChangeHandler(field)}
                    placeholder="Delivery instructions, landmarks, preferred time…"
                    rows={2}
                    value={field.state.value}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <p className="text-muted-foreground text-sm">
            Payment is{" "}
            <span className="font-medium text-foreground">
              Cash on Delivery
            </span>
            . You pay the courier when your watch arrives.
          </p>

          <form.Subscribe>
            {(state) => (
              <Button
                disabled={!state.canSubmit || state.isSubmitting}
                size="lg"
                type="submit"
              >
                {state.isSubmitting
                  ? "Placing order…"
                  : `Place order · ${formatBDT(total)}`}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <aside className="flex h-fit flex-col gap-4 rounded-2xl border p-6 lg:sticky lg:top-20">
          <h2 className="font-semibold text-sm tracking-tight">
            Order summary
          </h2>

          <ul className="flex flex-col gap-3">
            {cart.lines.map((line) => (
              <li
                className="flex items-start justify-between gap-3 text-sm"
                key={line.productId}
              >
                <span className="min-w-0">
                  <span className="line-clamp-1 font-medium text-foreground">
                    {line.name}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    × {line.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatBDT(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <Separator />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatBDT(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="tabular-nums">
                {shippingFee === 0 ? "Free" : formatBDT(shippingFee)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between font-semibold text-base">
            <span>Total</span>
            <span className="tabular-nums">{formatBDT(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
