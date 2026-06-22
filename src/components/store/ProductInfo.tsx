"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { BrandBrief } from "@/lib/types/product";

interface ProductInfoProps {
  name: string;
  brand: BrandBrief | null;
  ratingAvg: number;
  ratingCount: number;
  price: number;
  discountPercent: number;
  currentPrice: number;
  aboutPoints: string[];
}

function RatingStars({ average }: { average: number }) {
  return (
    <div className="flex" aria-label={`${average.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(average);
        const half = !filled && star - 0.5 <= average;
        return (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              filled ? "fill-yellow-400 text-yellow-400" : half ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground/30",
            )}
          />
        );
      })}
    </div>
  );
}

export function ProductInfo({
  name,
  brand,
  ratingAvg,
  ratingCount,
  price,
  discountPercent,
  currentPrice,
  aboutPoints,
}: ProductInfoProps) {
  const hasDiscount = discountPercent > 0;

  return (
    <div className="space-y-4">
      {brand && (
        <Link
          href={`/brands/${brand.slug}`}
          className="text-sm text-muted-foreground hover:text-primary hover:underline"
        >
          {brand.name}
        </Link>
      )}
      <h1 className="text-2xl font-bold leading-tight md:text-3xl">{name}</h1>
      <div className="flex items-center gap-2">
        <RatingStars average={ratingAvg} />
        {ratingCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {ratingAvg.toFixed(1)} ({ratingCount} reviews)
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold">{formatPrice(currentPrice)}</span>
        {hasDiscount && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(price)}
            </span>
            <span className="rounded bg-destructive/10 px-2 py-0.5 text-sm font-semibold text-destructive">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>
      {aboutPoints.length > 0 && (
        <div>
          <h2 className="mb-2 text-base font-semibold">About this item</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {aboutPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
