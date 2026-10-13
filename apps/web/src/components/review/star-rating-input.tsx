"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  disabled?: boolean;
  id?: string;
  onChange: (value: number) => void;
  value: number;
}

const STARS = [1, 2, 3, 4, 5] as const;

/** Accessible 1–5 star picker used by the review form. */
export function StarRatingInput({
  value,
  onChange,
  disabled,
  id,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  const handleSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
    onChange(Number(event.currentTarget.dataset.star));
  };

  const handleHover = (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FocusEvent<HTMLButtonElement>
  ) => {
    setHovered(Number(event.currentTarget.dataset.star));
  };

  const clearHover = () => {
    setHovered(null);
  };

  return (
    <div
      aria-label="Rating"
      className="flex items-center gap-1"
      id={id}
      onMouseLeave={clearHover}
      role="radiogroup"
    >
      {STARS.map((star) => (
        // biome-ignore lint/a11y/useSemanticElements: custom star picker; native radios cannot render the half/quarter-star affordance
        <button
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          className="rounded-sm p-0.5 transition-transform active:scale-90 disabled:opacity-50"
          data-star={star}
          disabled={disabled}
          key={star}
          onClick={handleSelect}
          onFocus={handleHover}
          onMouseEnter={handleHover}
          role="radio"
          type="button"
        >
          <Star
            className={cn(
              "size-6 transition-colors",
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
