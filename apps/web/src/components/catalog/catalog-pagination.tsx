"use client";

import { useRouter } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type CatalogFilters, catalogHref } from "@/lib/catalog-params";

interface CatalogPaginationProps {
  filters: CatalogFilters;
  totalPages: number;
}

export function CatalogPagination({
  filters,
  totalPages,
}: CatalogPaginationProps) {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  const hrefFor = (page: number) => catalogHref({ ...filters, page });
  const go = (page: number) => router.push(hrefFor(page), { scroll: false });

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {filters.page > 1 ? (
            <PaginationPrevious
              href={hrefFor(filters.page - 1)}
              onClick={(event) => {
                event.preventDefault();
                go(filters.page - 1);
              }}
            />
          ) : (
            <PaginationPrevious
              aria-disabled
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={hrefFor(page)}
                isActive={page === filters.page}
                onClick={(event) => {
                  event.preventDefault();
                  go(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          {filters.page < totalPages ? (
            <PaginationNext
              href={hrefFor(filters.page + 1)}
              onClick={(event) => {
                event.preventDefault();
                go(filters.page + 1);
              }}
            />
          ) : (
            <PaginationNext
              aria-disabled
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
