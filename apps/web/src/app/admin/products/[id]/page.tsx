import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { client } from "@/utils/orpc";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const product = await client.admin
    .getProduct({ productId: id })
    .catch(() => notFound());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-lg tracking-tight">Edit product</h2>
        <p className="text-muted-foreground text-sm">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
