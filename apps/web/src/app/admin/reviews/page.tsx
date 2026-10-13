import { AdminPager } from "@/components/admin/admin-pager";
import { DeleteButton } from "@/components/admin/delete-button";
import { RatingStars } from "@/components/product/rating-stars";
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
import { client } from "@/utils/orpc";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawPage = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const { items, pageMeta } = await client.admin.listReviews({ page });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-lg tracking-tight">Reviews</h2>
        <p className="text-muted-foreground text-sm">{pageMeta.total} total</p>
      </div>

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No reviews yet</EmptyTitle>
            <EmptyDescription>
              Customer reviews will appear here for moderation.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.productName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{item.customerName ?? "Customer"}</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {item.customerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RatingStars
                      rating={{ average: item.rating, count: 1 }}
                      showCount={false}
                    />
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                    {item.comment ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(new Date(item.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <DeleteButton
                        id={item.id}
                        kind="review"
                        name={`${item.customerName ?? "this customer"}'s review`}
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
        basePath="/admin/reviews"
        page={pageMeta.page}
        totalPages={pageMeta.totalPages}
      />
    </div>
  );
}
