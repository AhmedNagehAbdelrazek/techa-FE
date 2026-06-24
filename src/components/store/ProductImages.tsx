"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import type { ProductImage as ProductImageType } from "@/lib/types/product";

interface ProductImagesProps {
  images: ProductImageType[];
  selectedVariantImages?: ProductImageType[];
  productName: string;
}

export function ProductImages({ images, selectedVariantImages, productName }: ProductImagesProps) {
  const { t } = useTranslation();
  const displayImages = (selectedVariantImages && selectedVariantImages.length > 0) ? selectedVariantImages : images;
  const sorted = [...displayImages].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const current = sorted[selectedIndex] ?? sorted[0];

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setImgError(false);
  }, []);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
        <span className="text-sm text-muted-foreground">{t("No image")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-square overflow-hidden rounded-lg border"
        role="img"
        aria-label={current?.alt_text ?? productName}
      >
        {imgError ? (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">{t("No image")}</span>
          </div>
        ) : (
          <Image
            src={current.url}
            alt={current?.alt_text ?? productName}
            fill
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label={t("Product images")}>
          {sorted.map((img, index) => (
            <button
              key={img.id ?? index}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={img.alt_text ?? t("Image {{index}}", { index: index + 1 })}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-opacity",
                index === selectedIndex ? "border-primary opacity-100 ring-1 ring-primary" : "opacity-60 hover:opacity-100",
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? t("Image {{index}}", { index: index + 1 })}
                fill
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
      <div aria-live="polite" className="sr-only">
        {current?.alt_text
          ? t("Selected image: {{alt}}", { alt: current.alt_text })
          : t("Image {{index}} of {{total}}", { index: selectedIndex + 1, total: sorted.length })}
      </div>
    </div>
  );
}
