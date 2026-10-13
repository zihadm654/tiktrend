"use client";

import { useMutation } from "@tanstack/react-query";
import { categoryWriteSchema } from "@tiktrend/api/lib/schemas";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
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
import { client, queryClient } from "@/utils/orpc";

import { DeleteButton } from "./delete-button";

export interface AdminCategory {
  description: string | null;
  id: string;
  image: string | null;
  name: string;
  productCount: number;
  slug: string;
  sortOrder: number;
}

interface CategoryFormProps {
  editing: AdminCategory | null;
  onDone: () => void;
}

function saveLabel(isPending: boolean, isEditing: boolean): string {
  if (isPending) {
    return "Saving…";
  }
  return isEditing ? "Save changes" : "Create category";
}

function CategoryForm({ editing, onDone }: CategoryFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [image, setImage] = useState(editing?.image ?? "");
  const [sortOrder, setSortOrder] = useState(String(editing?.sortOrder ?? 0));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: ReturnType<typeof categoryWriteSchema.parse>) => {
      if (editing) {
        return client.admin.updateCategory({
          ...payload,
          categoryId: editing.id,
        });
      }
      return client.admin.createCategory(payload);
    },
    onError: (error) => toast.error(error.message),
    onSuccess: async () => {
      toast.success(editing ? "Category updated." : "Category created.");
      await queryClient.invalidateQueries();
      onDone();
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const parsed = categoryWriteSchema.safeParse({
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      name,
      slug: slug.trim() || undefined,
      sortOrder: Math.max(0, Math.trunc(Number(sortOrder) || 0)),
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0] ?? "form")] ??= issue.message;
      }
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    mutation.mutate(parsed.data);
  };

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border p-4"
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="cat-name">Name</FieldLabel>
            <Input
              id="cat-name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="cat-slug">Slug</FieldLabel>
            <Input
              id="cat-slug"
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from name"
              value={slug}
            />
            <FieldError>{errors.slug}</FieldError>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="cat-description">Description</FieldLabel>
          <Textarea
            id="cat-description"
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            value={description}
          />
          <FieldError>{errors.description}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="cat-image">Image URL</FieldLabel>
            <Input
              id="cat-image"
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              value={image}
            />
            <FieldError>{errors.image}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="cat-sort">Sort order</FieldLabel>
            <Input
              id="cat-sort"
              min={0}
              onChange={(e) => setSortOrder(e.target.value)}
              step={1}
              type="number"
              value={sortOrder}
            />
            <FieldError>{errors.sortOrder}</FieldError>
          </Field>
        </div>
      </FieldGroup>

      <div className="flex items-center gap-2">
        <Button disabled={mutation.isPending} size="sm" type="submit">
          {saveLabel(mutation.isPending, editing !== null)}
        </Button>
        {editing ? (
          <Button onClick={onDone} size="sm" type="button" variant="ghost">
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function CategoryManager({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [sel, setSel] = useState<string>("new");
  const [formKey, setFormKey] = useState(0);

  const activeEditing =
    sel === "new"
      ? null
      : (categories.find((category) => category.id === sel) ?? null);

  const handleSelect = (value: string) => {
    setSel(value);
    setFormKey((key) => key + 1);
  };

  const handleDone = () => {
    setSel("new");
    setFormKey((key) => key + 1);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          onValueChange={(value) => handleSelect(value as string)}
          value={sel}
        >
          <SelectTrigger aria-label="Choose category to edit" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="new">+ New category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={() => handleSelect("new")} size="sm" variant="outline">
          <PlusIcon data-icon />
          New
        </Button>
      </div>

      <CategoryForm editing={activeEditing} key={formKey} onDone={handleDone} />

      <ul className="flex flex-col divide-y rounded-2xl border">
        {categories.map((category) => (
          <li
            className="flex items-center justify-between gap-4 p-4"
            key={category.id}
          >
            <div className="flex flex-col">
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground text-xs">
                {category.slug} · {category.productCount} product
                {category.productCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                aria-label={`Edit ${category.name}`}
                onClick={() => handleSelect(category.id)}
                size="icon-sm"
                variant="ghost"
              >
                <PencilIcon />
              </Button>
              <DeleteButton
                id={category.id}
                kind="category"
                name={category.name}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
