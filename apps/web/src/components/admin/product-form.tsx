"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { productWriteSchema } from "@tiktrend/api/lib/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { takaToMinorUnits } from "@/lib/money";
import { client, orpc, queryClient } from "@/utils/orpc";

export interface AdminProduct {
  attributes: Record<string, string>;
  categoryId: string;
  compareAtPrice: number | null;
  description: string;
  featured: boolean;
  id: string;
  images: string[];
  name: string;
  price: number;
  sku: string;
  slug: string;
  stock: number;
}

interface ProductFormProps {
  product?: AdminProduct;
}

function attributesToText(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function textToAttributes(text: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const separator = trimmed.indexOf(":");
    if (separator === -1) {
      entries[trimmed] = "";
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    if (key) {
      entries[key] = trimmed.slice(separator + 1).trim();
    }
  }
  return entries;
}

function productSaveLabel(isPending: boolean, isEdit: boolean): string {
  if (isPending) {
    return "Saving…";
  }
  return isEdit ? "Save changes" : "Create product";
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = product !== undefined;

  const categoriesQuery = useQuery(
    orpc.admin.listCategoryOptions.queryOptions()
  );

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? String(product.price / 100) : ""
  );
  const initialCompareAtPrice = product?.compareAtPrice ?? null;
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialCompareAtPrice === null ? "" : String(initialCompareAtPrice / 100)
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState((product?.images ?? []).join("\n"));
  const [attributes, setAttributes] = useState(
    attributesToText(product?.attributes ?? {})
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const saveMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof productWriteSchema.parse>) => {
      if (isEdit && product) {
        return client.admin.updateProduct({
          ...payload,
          productId: product.id,
        });
      }
      return client.admin.createProduct(payload);
    },
    onError: (error) => toast.error(error.message),
    onSuccess: async () => {
      toast.success(isEdit ? "Product updated." : "Product created.");
      await queryClient.invalidateQueries();
      router.push("/admin/products");
      router.refresh();
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const compareValue = compareAtPrice.trim();
    const candidate = {
      attributes: textToAttributes(attributes),
      categoryId,
      compareAtPrice:
        compareValue === ""
          ? null
          : (takaToMinorUnits(Number(compareValue)) ?? null),
      description,
      featured,
      images: images
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      name,
      price: takaToMinorUnits(Number(price)) ?? 0,
      sku: sku.trim() || undefined,
      slug: slug.trim() || undefined,
      stock: Math.max(0, Math.trunc(Number(stock) || 0)),
    };

    const parsed = productWriteSchema.safeParse(candidate);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    saveMutation.mutate(parsed.data);
  };

  return (
    <form className="flex max-w-3xl flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
          <FieldError>{fieldErrors.name}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              id="slug"
              onChange={(event) => setSlug(event.target.value)}
              placeholder="auto from name"
              value={slug}
            />
            <FieldDescription>
              Lowercase letters, numbers, and dashes.
            </FieldDescription>
            <FieldError>{fieldErrors.slug}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="sku">SKU</FieldLabel>
            <Input
              id="sku"
              onChange={(event) => setSku(event.target.value)}
              placeholder="auto-generated"
              value={sku}
            />
            <FieldError>{fieldErrors.sku}</FieldError>
          </Field>
        </div>

        <Field>
          <FieldLabel>Category</FieldLabel>
          <Select
            onValueChange={(value) => setCategoryId(value as string)}
            value={categoryId}
          >
            <SelectTrigger className="w-full" id="categoryId">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(categoriesQuery.data ?? []).map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{fieldErrors.categoryId}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            value={description}
          />
          <FieldError>{fieldErrors.description}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="price">Price (৳)</FieldLabel>
            <Input
              id="price"
              min={0}
              onChange={(event) => setPrice(event.target.value)}
              step={1}
              type="number"
              value={price}
            />
            <FieldError>{fieldErrors.price}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="compareAtPrice">Compare at (৳)</FieldLabel>
            <Input
              id="compareAtPrice"
              min={0}
              onChange={(event) => setCompareAtPrice(event.target.value)}
              placeholder="optional"
              step={1}
              type="number"
              value={compareAtPrice}
            />
            <FieldError>{fieldErrors.compareAtPrice}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="stock">Stock</FieldLabel>
            <Input
              id="stock"
              min={0}
              onChange={(event) => setStock(event.target.value)}
              step={1}
              type="number"
              value={stock}
            />
            <FieldError>{fieldErrors.stock}</FieldError>
          </Field>
        </div>

        <Field orientation="horizontal">
          <Checkbox
            checked={featured}
            id="featured"
            onCheckedChange={(checked) => setFeatured(checked === true)}
          />
          <FieldLabel htmlFor="featured">Feature on the home page</FieldLabel>
        </Field>

        <Field>
          <FieldLabel htmlFor="images">Images</FieldLabel>
          <Textarea
            id="images"
            onChange={(event) => setImages(event.target.value)}
            placeholder={"https://…/front.jpg\nhttps://…/side.jpg"}
            rows={3}
            value={images}
          />
          <FieldDescription>
            One image URL per line (at least one).
          </FieldDescription>
          <FieldError>{fieldErrors.images}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="attributes">Specifications</FieldLabel>
          <Textarea
            id="attributes"
            onChange={(event) => setAttributes(event.target.value)}
            placeholder={
              "Movement: Automatic\nCase: 40mm steel\nWater resistance: 100m"
            }
            rows={4}
            value={attributes}
          />
          <FieldDescription>
            One &quot;Label: Value&quot; pair per line.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-2">
        <Button disabled={saveMutation.isPending} type="submit">
          {productSaveLabel(saveMutation.isPending, isEdit)}
        </Button>
        <Button
          disabled={saveMutation.isPending}
          onClick={() => router.push("/admin/products")}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
