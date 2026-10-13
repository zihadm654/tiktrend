"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

const FALLBACK_IMAGE = "https://picsum.photos/seed/watch-placeholder/800/800";

interface ProductGalleryProps {
  alt: string;
  images: string[];
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const safeImages = images.length > 0 ? images : [FALLBACK_IMAGE];
  const current =
    safeImages[Math.min(index, safeImages.length - 1)] ??
    safeImages[0] ??
    FALLBACK_IMAGE;

  const handleThumbnailClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = Number(event.currentTarget.dataset.index);
    if (!Number.isNaN(next)) {
      setIndex(next);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          alt={alt}
          className="object-cover"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          src={current}
        />
      </div>

      {safeImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((src, imageIndex) => (
            <button
              aria-label={`View image ${imageIndex + 1}`}
              aria-pressed={imageIndex === index}
              className={cn(
                "relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-muted outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                imageIndex === index
                  ? "border-ring"
                  : "border-border hover:border-foreground/30"
              )}
              data-index={imageIndex}
              key={`${src}-${imageIndex}`}
              onClick={handleThumbnailClick}
              type="button"
            >
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="80px"
                src={src}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
