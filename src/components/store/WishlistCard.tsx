"use client";

import Image from "next/image";
import { Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WishlistItemWithProduct } from "@/lib/types/wishlist";

interface WishlistCardProps {
  item: WishlistItemWithProduct;
  onRemove: (wishlistId: string) => void;
  onAddToCart: (wishlistId: string) => void;
  isRemoving?: boolean;
  isAddingToCart?: boolean;
}

export function WishlistCard({
  item,
  onRemove,
  onAddToCart,
  isRemoving,
  isAddingToCart,
}: WishlistCardProps) {
  const hasDiscount = item.Product.discount_percent > 0;
  const discountedPrice = hasDiscount
    ? item.Product.price * (1 - item.Product.discount_percent / 100)
    : item.Product.price;
  const outOfStock = !item.Product.is_in_stock;

  return (
    <div className="group bg-card relative flex flex-col overflow-hidden rounded-lg border">
      <div className="relative aspect-square overflow-hidden">
        {item.Product.primary_image ? (
          <Image
            src={item.Product.primary_image.url}
            alt={item.Product.primary_image.alt_text ?? item.Product.name}
            fill
            className="object-contain transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="bg-muted flex h-full items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        {hasDiscount && (
          <span className="bg-destructive text-destructive-foreground absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-semibold">
            -{item.Product.discount_percent}%
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isRemoving}
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 z-10"
          aria-label="Remove from wishlist"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {item.Product.brand && (
          <p className="text-muted-foreground text-xs">{item.Product.brand.name}</p>
        )}
        <h3 className="line-clamp-2 text-sm leading-tight font-medium">
          {item.Product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold">{formatPrice(discountedPrice)}</span>
          {hasDiscount && (
            <span className="text-muted-foreground text-sm line-through">
              {formatPrice(item.Product.price)}
            </span>
          )}
        </div>
        <div className="mt-2">
          {outOfStock ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Out of Stock</span>
            </div>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="w-full"
              disabled={isAddingToCart}
              onClick={() => onAddToCart(item.id)}
            >
              <ShoppingCart className="ml-1.5 h-4 w-4" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function WishlistCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
