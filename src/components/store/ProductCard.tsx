"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductListItem } from "@/lib/types/product";
import { WishlistButton } from "./WishlistButton";

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
      {count > 0 && <span className="text-muted-foreground text-xs">({count})</span>}
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock_qty <= 0;
  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  return (
    <div className="group bg-card relative isolate flex flex-col overflow-hidden rounded-lg border transition-shadow duration-300 dark:hover:shadow-[0_0_24px_-8px_hsl(183_100%_50%_/_0.25)] hover:shadow-md">
      <div className="relative aspect-square overflow-hidden">
        {product.primary_image ? (
          <Image
            src={product.primary_image.url}
            alt={product.primary_image.alt_text ?? product.name}
            fill
            className={cn("object-cover transition-transform group-hover:scale-105", isOutOfStock && "opacity-50")}
            loading="lazy"
          />
        ) : (
          <div className="bg-muted flex h-full items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        <div className="absolute top-2 box-border flex w-full flex-row justify-between px-2">
          {hasDiscount && !isOutOfStock && (
            <span className="bg-destructive text-destructive-foreground absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-semibold">
              -{product.discount_percent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-muted-foreground text-primary-foreground absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-semibold">
              Out of Stock
            </span>
          )}
          <WishlistButton productId={product.id} className={"z-99 border-0 shadow-none hover:bg-blend-difference! "} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.brand && <p className="text-muted-foreground text-xs">{product.brand.name}</p>}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm leading-tight font-medium hover:underline">
            {product.name}
          </h3>
        </Link>
        <RatingStars average={product.rating_avg} count={product.rating_count} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          {isOutOfStock ? (
            <span className="text-muted-foreground text-xs">Out of Stock</span>
          ) : (
            <>
              <span className="font-display text-base font-bold">{formatPrice(discountedPrice)}</span>
              {hasDiscount && (
                <span className="text-muted-foreground text-sm line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </>
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
