import { PencilIcon, PlusIcon } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { AdminPager } from "@/components/admin/admin-pager";
import { AdminSearch } from "@/components/admin/admin-search";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT } from "@/lib/money";
import { client } from "@/utils/orpc";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q)?.trim() || undefined;
  const rawPage = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const { items, pageMeta } = await client.admin.listProducts({ page, q });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSearch
          basePath="/admin/products"
          defaultValue={q ?? ""}
          paramKey="q"
          placeholder="Search products…"
        />
        <Button render={<Link href="/admin/products/new" />} size="sm">
          <PlusIcon data-icon />
          New product
        </Button>
      </div>

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyDescription>
              {q
                ? `Nothing matches “${q}”.`
                : "Create your first product to get started."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.images[0] ? (
                          <Image
                            alt=""
                            className="object-cover"
                            fill
                            sizes="40px"
                            src={item.images[0]}
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[0.65rem] text-muted-foreground">
                          {item.sku}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.categoryName ?? "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatBDT(item.price)}
                  </TableCell>
                  <TableCell className="tabular-nums">{item.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {item.featured ? (
                        <Badge variant="secondary">Featured</Badge>
                      ) : null}
                      <Button
                        aria-label={`Edit ${item.name}`}
                        render={
                          <Link href={`/admin/products/${item.id}` as Route} />
                        }
                        size="icon-sm"
                        variant="ghost"
                      >
                        <PencilIcon />
                      </Button>
                      <DeleteButton
                        id={item.id}
                        kind="product"
                        name={item.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminPager
        basePath="/admin/products"
        page={pageMeta.page}
        query={{ q }}
        totalPages={pageMeta.totalPages}
      />
    </div>
  );
}
