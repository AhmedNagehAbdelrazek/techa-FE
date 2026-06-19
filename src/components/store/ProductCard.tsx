"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductListItem } from "@/lib/types/product";

interface ProductCardProps {
  product: ProductListItem;
  currencySymbol?: string;
}

function RatingStars({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-label={`${average} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(average);
          const half = !filled && star - 0.5 <= average;
          return (
            <svg
              key={star}
              className={cn(
                "h-3.5 w-3.5",
                filled ? "text-yellow-400" : half ? "text-yellow-400" : "text-muted-foreground/30",
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
      {count > 0 && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = hasDiscount
    ? product.base_price * (1 - product.discount_percent / 100)
    : product.base_price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-square overflow-hidden">
        {product.primary_image ? (
          <Image
            src={product.primary_image.url}
            alt={product.primary_image.alt_text ?? product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded bg-destructive px-1.5 py-0.5 text-xs font-semibold text-destructive-foreground">
            -{product.discount_percent}%
          </span>
        )}
        <button
          type="button"
          className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          aria-label="Toggle wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.brand && (
          <p className="text-xs text-muted-foreground">{product.brand.name}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-tight hover:underline">
            {product.name}
          </h3>
        </Link>
        <RatingStars average={product.rating_avg} count={product.rating_count} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold">
            {formatPrice(discountedPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.base_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}
