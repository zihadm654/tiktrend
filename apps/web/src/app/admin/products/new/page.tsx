import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-lg tracking-tight">New product</h2>
        <p className="text-muted-foreground text-sm">
          Add a watch to the catalog.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
