import { CategoryManager } from "@/components/admin/category-manager";
import { client } from "@/utils/orpc";

export default async function AdminCategoriesPage() {
  const categories = await client.admin.listCategories();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-lg tracking-tight">Categories</h2>
        <p className="text-muted-foreground text-sm">
          Organize your catalog. A category can only be deleted when empty.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
