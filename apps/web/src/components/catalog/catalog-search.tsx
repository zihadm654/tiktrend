"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { type CatalogFilters, catalogHref } from "@/lib/catalog-params";

interface CatalogSearchProps {
  filters: CatalogFilters;
}

export function CatalogSearch({ filters }: CatalogSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(filters.q ?? "");

  const submit = () => {
    const q = value.trim();
    router.replace(
      catalogHref({
        ...filters,
        page: 1,
        q: q || undefined,
      }),
      { scroll: false }
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <search className="w-full">
      <form className="w-full" onSubmit={handleSubmit}>
        <InputGroup>
          <InputGroupInput
            aria-label="Search watches"
            onChange={handleChange}
            placeholder="Search watches…"
            value={value}
          />
          <InputGroupAddon align="inline-end">
            <Button
              aria-label="Search"
              size="icon-sm"
              type="submit"
              variant="ghost"
            >
              <SearchIcon data-icon />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </search>
  );
}
