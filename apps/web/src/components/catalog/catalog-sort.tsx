"use client";

import type { CatalogSort as CatalogSortKey } from "@tiktrend/api/lib/schemas";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CatalogFilters, catalogHref } from "@/lib/catalog-params";

const OPTIONS: ReadonlyArray<{ value: CatalogSortKey; label: string }> = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Popular", value: "popular" },
];

interface CatalogSortProps {
  filters: CatalogFilters;
}

export function CatalogSort({ filters }: CatalogSortProps) {
  const router = useRouter();

  const handleSortChange = (sort: CatalogSortKey | null) => {
    if (!sort) {
      return;
    }
    router.replace(
      catalogHref({
        ...filters,
        page: 1,
        sort,
      }),
      { scroll: false }
    );
  };

  return (
    <Select onValueChange={handleSortChange} value={filters.sort}>
      <SelectTrigger aria-label="Sort products" className="w-full sm:w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
