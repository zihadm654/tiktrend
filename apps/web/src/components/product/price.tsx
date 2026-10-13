import { formatBDT } from "@/lib/money";
import { cn } from "@/lib/utils";

interface PriceProps {
  className?: string;
  compareAtPrice?: number | null;
  price: number;
}

export function Price({ price, compareAtPrice, className }: PriceProps) {
  const onSale =
    compareAtPrice !== undefined &&
    compareAtPrice !== null &&
    compareAtPrice > price;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="font-medium text-foreground tabular-nums">
        {formatBDT(price)}
      </span>
      {onSale ? (
        <span className="text-muted-foreground text-xs tabular-nums line-through">
          {formatBDT(compareAtPrice)}
        </span>
      ) : null}
    </div>
  );
}
