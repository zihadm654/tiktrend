"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type CatalogFilters, catalogHref } from "@/lib/catalog-params";
import { takaToMinorUnits } from "@/lib/money";

interface PriceFilterProps {
  filters: CatalogFilters;
}

export function PriceFilter({ filters }: PriceFilterProps) {
  const router = useRouter();

  // Inputs are whole-taka values the customer types.
  const [minInput, setMinInput] = useState(
    filters.minPrice === undefined ? "" : String(filters.minPrice / 100)
  );
  const [maxInput, setMaxInput] = useState(
    filters.maxPrice === undefined ? "" : String(filters.maxPrice / 100)
  );

  const apply = () => {
    const minPrice = takaToMinorUnits(Number(minInput));
    const maxPrice = takaToMinorUnits(Number(maxInput));
    router.replace(
      catalogHref({
        ...filters,
        maxPrice,
        minPrice,
        page: 1,
      }),
      { scroll: false }
    );
  };

  const hasActive =
    filters.minPrice !== undefined || filters.maxPrice !== undefined;

  return (
    <FieldGroup className="gap-2">
      <div className="flex items-center justify-between">
        <FieldTitle>Price range</FieldTitle>
        {hasActive ? (
          <Button
            className="h-6 px-1 text-muted-foreground"
            onClick={() => {
              router.replace(
                catalogHref({
                  ...filters,
                  maxPrice: undefined,
                  minPrice: undefined,
                  page: 1,
                }),
                { scroll: false }
              );
            }}
            size="xs"
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        ) : null}
      </div>
      <Field className="w-full">
        <FieldLabel className="sr-only" htmlFor="min-price">
          Minimum price
        </FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            id="min-price"
            inputMode="numeric"
            min={0}
            onChange={(event) => setMinInput(event.target.value)}
            placeholder="Min ৳"
            type="number"
            value={minInput}
          />
          <span aria-hidden>—</span>
          <Input
            aria-label="Maximum price"
            inputMode="numeric"
            min={0}
            onChange={(event) => setMaxInput(event.target.value)}
            placeholder="Max ৳"
            type="number"
            value={maxInput}
          />
          <Button onClick={apply} size="sm" type="button">
            Apply
          </Button>
        </div>
      </Field>
    </FieldGroup>
  );
}
