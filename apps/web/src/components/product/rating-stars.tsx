import { Star, StarHalf } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RatingSummary {
  average: number | null;
  count: number;
}

interface RatingStarsProps {
  className?: string;
  rating: RatingSummary;
  showCount?: boolean;
}

export function RatingStars({
  rating,
  className,
  showCount = true,
}: RatingStarsProps) {
  if (rating.count === 0) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>
        No reviews yet
      </span>
    );
  }

  // Round to the nearest half star for rendering.
  const value = Math.round((rating.average ?? 0) * 2) / 2;

  return (
    <span
      aria-label={`Rated ${rating.average?.toFixed(1)} out of 5 from ${rating.count} review${rating.count === 1 ? "" : "s"}`}
      className={cn("flex items-center gap-1.5", className)}
      role="img"
    >
      <span aria-hidden className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((position) => {
          const isHalf = value >= position - 0.5 && value < position;
          const isFilled = value >= position;
          return isHalf ? (
            <StarHalf
              className="size-3.5 fill-amber-400 text-amber-400"
              key={position}
            />
          ) : (
            <Star
              className={cn(
                "size-3.5",
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
              key={position}
            />
          );
        })}
      </span>
      {showCount ? (
        <span className="text-muted-foreground text-xs tabular-nums">
          {rating.count} review{rating.count === 1 ? "" : "s"}
        </span>
      ) : null}
    </span>
  );
}
