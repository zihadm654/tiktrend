"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";

interface AdminSearchProps {
  basePath: string;
  defaultValue?: string;
  paramKey: string;
  placeholder?: string;
}

export function AdminSearch({
  basePath,
  paramKey,
  placeholder = "Search…",
  defaultValue = "",
}: AdminSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) {
      params.set(paramKey, trimmed);
    }
    const qs = params.toString();
    router.push((qs ? `${basePath}?${qs}` : basePath) as Route);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <search className="w-full max-w-sm">
      <form className="flex w-full items-center gap-2" onSubmit={submit}>
        <Input
          aria-label={placeholder}
          name={paramKey}
          onChange={handleChange}
          placeholder={placeholder}
          type="search"
          value={value}
        />
        <button
          className="font-medium text-primary text-xs underline-offset-4 hover:underline"
          type="submit"
        >
          Search
        </button>
      </form>
    </search>
  );
}
